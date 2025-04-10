// models/actionItemModel.js
const db = require('../config/db');

const ActionItem = {
  getAll: async (filters = {}) => {
    let query = `
      SELECT 
        id, 
        title, 
        type, 
        entity_id AS "entityId", 
        entity_type AS "entityType", 
        priority,
        TO_CHAR(created_at, 'YYYY-MM-DD') AS "createdAt"
      FROM action_items
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.priority) {
      params.push(filters.priority);
      query += ` AND priority = $${params.length}`;
    }
    
    if (filters.type) {
      params.push(filters.type);
      query += ` AND type = $${params.length}`;
    }
    
    query += ` ORDER BY 
      CASE 
        WHEN priority = 'high' THEN 1
        WHEN priority = 'medium' THEN 2
        ELSE 3
      END,
      created_at DESC`;
    
    return await db.any(query, params);
  },
  
  create: async (item) => {
    return await db.one(`
      INSERT INTO action_items (title, type, entity_id, entity_type, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id, 
        title, 
        type, 
        entity_id AS "entityId", 
        entity_type AS "entityType", 
        priority,
        TO_CHAR(created_at, 'YYYY-MM-DD') AS "createdAt"
    `, [item.title, item.type, item.entityId, item.entityType, item.priority]);
  }
};

module.exports = ActionItem;