import { env } from '../../config/env.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';
import { AppError } from '../../core/errors/AppError.js';

const WHOLESALE_RATE_ID = '99113';
const CITY = 'BOGOTA';

export const availabilityController = {
  check: asyncHandler(async (req, res) => {
    const { checkIn, nights, adults, childrenAges } = req.query;

    if (!checkIn || !nights || !adults) {
      throw new AppError('Se requieren checkIn, nights y adults', 400, 'VALIDATION_ERROR');
    }

    const childrenCount = parseInt(childrenAges ?? 0, 10) || 0;
    const childrenAgesArray = Array.from({ length: childrenCount }, () => 8);

    const params = new URLSearchParams({
      checkin: checkIn,
      nights: String(nights),
      city: CITY,
    });

    const url = `${env.AUTOCORE_API_URL}/bookings/agencies/wholesale/availability?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'access_key': env.AUTOCORE_ACCESS_KEY,
        'secret_key': env.AUTOCORE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ layout: [{ adults: String(adults), children_ages: childrenAgesArray }] }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new AppError(`Error al consultar disponibilidad: ${response.status} — ${text}`, 502, 'UPSTREAM_ERROR');
    }

    const data = await response.json();

    // Response is an array of hotels; find Windsor House by roomcloud_id
    const hotels = Array.isArray(data) ? data : [data];
    const hotelEntry = hotels.find(h => h.hotel?.roomcloud_id === env.AUTOCORE_HOTEL_ID) || {};
    const availabilityBlock = (hotelEntry.availability || [])[0] || {};
    const availableRooms = availabilityBlock.available_rooms || [];

    const standardRooms = availableRooms.flatMap(room =>
      room.products
        .filter(p => p.rateId === WHOLESALE_RATE_ID)
        .map(p => ({
          roomId: room.roomId,
          roomName: room.roomName,
          count: room.count,
          productName: p.roomName,
          rateDescription: p.rateDescription,
          boardTypeDescription: p.boardTypeDescription,
          currency: p.currency,
          amountBeforeTax: p.baseRate?.amountBeforeTax ?? 0,
          amountAfterTax: p.baseRate?.amountAfterTax ?? 0,
          refundable: p.refundable,
          cancellationPolicy: p.cancellationPolicy,
          rateId: p.rateId,
        }))
    );

    successResponse(res, { totalCount: availabilityBlock.total_count ?? 0, rooms: standardRooms });
  }),
};
