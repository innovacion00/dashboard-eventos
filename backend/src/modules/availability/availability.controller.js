import { env } from '../../config/env.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';
import { AppError } from '../../core/errors/AppError.js';

export const availabilityController = {
  check: asyncHandler(async (req, res) => {
    const { checkIn, nights, adults, childrenAges } = req.query;

    if (!checkIn || !nights || !adults) {
      throw new AppError('Se requieren checkIn, nights y adults', 400, 'VALIDATION_ERROR');
    }

    const params = new URLSearchParams({
      checkin: checkIn,
      nights: String(nights),
      adults: String(adults),
      children_ages: String(childrenAges ?? 0),
      hotel_id: env.AUTOCORE_HOTEL_ID,
    });

    const url = `${env.AUTOCORE_API_URL}/bookings/availability?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'access_key': env.AUTOCORE_ACCESS_KEY,
        'secret_key': env.AUTOCORE_SECRET_KEY,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new AppError(`Error al consultar disponibilidad: ${response.status} — ${text}`, 502, 'UPSTREAM_ERROR');
    }

    const data = await response.json();

    const standardRooms = (data.available_rooms || []).flatMap(room =>
      room.products
        .filter(p => p.rateId === '84414')
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

    successResponse(res, { totalCount: data.total_count, rooms: standardRooms });
  }),
};
