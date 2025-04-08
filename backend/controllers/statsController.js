const db = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const roomUtilizationQuery = `
            WITH total_hours AS (
                SELECT COUNT(*) * 10 AS total FROM Room
            ), 
            booked_hours AS (
                SELECT SUM(EXTRACT(EPOCH FROM (endTime - startTime)) / 3600) AS booked 
                FROM Event
                WHERE startTime >= CURRENT_DATE - INTERVAL '30 days'
            )
            SELECT ROUND((booked / total) * 100) AS utilization 
            FROM booked_hours, total_hours
        `;
    const roomUtilization = await db.one(roomUtilizationQuery);

    const staffWorkloadQuery = `
            SELECT ROUND(AVG(
                (SELECT SUM(EXTRACT(EPOCH(FROM (endTime - startTime)) / 3600)
                FROM Event
                WHERE staffId = staff.id
                AND startTime >= CURRENT_DATE - INTERVAL '7 days'
                )
            ), 1) AS avg_workload
            FROM Staff
            `;
    const staffWorkload = await db.one(staffWorkloadQuery);
    const scheduledEventsQuery = `
      SELECT COUNT(*) AS total
      FROM Event
      WHERE startTime >= CURRENT_DATE
    `;
    const scheduledEvents = await db.one(scheduledEventsQuery);

    // Constraint satisfaction rate (percentage of events without soft warnings)
    // This is a simplification - you'd need to adapt based on how you store constraint info
    const constraintSatisfactionQuery = `
      WITH total_events AS (
        SELECT COUNT(*) AS total FROM Event
        WHERE startTime >= CURRENT_DATE
      ),
      perfect_events AS (
        SELECT COUNT(*) AS perfect 
        FROM Event
        WHERE startTime >= CURRENT_DATE
        AND id NOT IN (
          -- This would be events with warnings or violations
          -- You'll need to adapt this based on your schema
          SELECT event_id FROM EventWarning 
        )
      )
      SELECT ROUND((perfect.perfect / total.total) * 100) AS satisfaction
      FROM total_events total, perfect_events perfect
    `;
    const constraintSatisfaction = await db.one(constraintSatisfactionQuery);

    res.json({
      roomUtilization: roomUtilization.utilization || 0,
      staffWorkload: staffWorkload.avg_workload || 0,
      scheduledEvents: scheduledEvents.total || 0,
      constraintSatisfaction: constraintSatisfaction.satisfaction || 0,
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      error: "Error fetching statistics",
      // For development, you might want to return dummy values initially
      roomUtilization: 65,
      staffWorkload: 12.5,
      scheduledEvents: 24,
      constraintSatisfaction: 85,
    });
  }
};

module.exports = {
    getDashboardStats
};
