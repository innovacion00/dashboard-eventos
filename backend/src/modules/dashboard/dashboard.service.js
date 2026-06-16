import { Opportunity } from '../opportunities/opportunity.model.js';
import { Task } from '../tasks/task.model.js';
import { Activity } from '../activities/activity.model.js';
import { goalRepository } from '../goals/goal.repository.js';

export const dashboardService = {
  async getMonthlySnapshot(year, month) {
    const y = Number(year);
    const m = Number(month);
    const projectionMonth = `${y}-${String(m).padStart(2, '0')}`;

    const now = new Date();

    const [goal, opportunities, pendingTasks, overdueTasks, recentActivities] = await Promise.all([
      goalRepository.findByYearMonth(y, m),
      Opportunity.find({ projectionMonth, active: true }).lean(),
      Task.countDocuments({ status: { $in: ['PENDIENTE', 'EN_PROGRESO'] } }),
      Task.countDocuments({ status: 'PENDIENTE', dueDate: { $lt: now } }),
      Activity.find({ date: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } })
        .populate('companyId', 'name')
        .populate('ownerId', 'name')
        .sort({ date: -1 })
        .limit(50)
        .lean(),
    ]);

    const confirmedOpps = opportunities.filter((o) => o.stage === 'CONFIRMADO');
    const activeOpps = opportunities.filter(
      (o) => o.stage !== 'PERDIDO' && o.stage !== 'CONFIRMADO'
    );

    const confirmedSales = confirmedOpps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
    const confirmedEventsCount = confirmedOpps.length;
    const pipelineTotal = activeOpps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
    const pipelineWeighted = activeOpps.reduce((sum, o) => sum + (o.weightedValue || 0), 0);

    const revenueTarget = goal?.revenueTarget || 0;
    const gap = Math.max(revenueTarget - confirmedSales, 0);
    const coverage = gap === 0 ? null : pipelineWeighted / gap;
    const averageTicket = confirmedEventsCount === 0 ? 0 : confirmedSales / confirmedEventsCount;

    const presaleThreshold = (goal?.presaleThreshold || 60) / 100;
    const presaleAlert = revenueTarget > 0 && pipelineWeighted < presaleThreshold * revenueTarget;

    const overdueOpportunities = await Opportunity.find({
      active: true,
      nextActionAt: { $lt: now },
      stage: { $nin: ['PERDIDO', 'CONFIRMADO'] },
    })
      .populate('companyId', 'name')
      .sort({ nextActionAt: 1 })
      .limit(20)
      .lean();

    return {
      period: { year: y, month: m, projectionMonth },
      goal: goal
        ? {
            revenueTarget: goal.revenueTarget,
            eventCountTarget: goal.eventCountTarget,
            averageTicketTarget: goal.averageTicketTarget,
            marginTarget: goal.marginTarget,
            presaleThreshold: goal.presaleThreshold,
          }
        : null,
      sales: {
        confirmedSales,
        confirmedEventsCount,
        averageTicket,
        pipelineTotal,
        pipelineWeighted,
        gap,
        coverage,
      },
      alerts: {
        presaleAlert,
        overdueTasksCount: overdueTasks,
        overdueOpportunitiesCount: overdueOpportunities.length,
      },
      tasks: { pending: pendingTasks, overdue: overdueTasks },
      overdueOpportunities,
      recentActivities,
    };
  },
};
