const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db = null;

/**
 * Initialize the SQLite database
 */
function initDatabase() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'chat_history.db');

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Better performance for writes

    // Create conversations table
    db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            model TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create messages table
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            attachment TEXT,
            image_data TEXT,
            mime_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )
    `);

    // Create index for faster message lookups
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_messages_conversation 
        ON messages(conversation_id)
    `);

    console.log('Database initialized at:', dbPath);
    return db;
}

/**
 * Generate a unique ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new conversation
 */
function createConversation(title = 'New Chat', model = null) {
    const id = generateId();
    const stmt = db.prepare(`
        INSERT INTO conversations (id, title, model, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `);
    stmt.run(id, title, model);
    return { id, title, model, created_at: new Date().toISOString() };
}

/**
 * Get all conversations, ordered by most recent
 */
function getConversations() {
    const stmt = db.prepare(`
        SELECT c.*, 
               (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
        FROM conversations c
        ORDER BY c.updated_at DESC
    `);
    return stmt.all();
}

/**
 * Get a single conversation by ID
 */
function getConversation(id) {
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    return stmt.get(id);
}

/**
 * Update conversation title
 */
function updateConversationTitle(id, title) {
    const stmt = db.prepare(`
        UPDATE conversations 
        SET title = ?, updated_at = datetime('now')
        WHERE id = ?
    `);
    stmt.run(title, id);
    return getConversation(id);
}

/**
 * Delete a conversation and its messages
 */
function deleteConversation(id) {
    // Delete messages first (foreign key)
    db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(id);
    db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
    return true;
}

/**
 * Get all messages for a conversation
 */
function getMessages(conversationId) {
    const stmt = db.prepare(`
        SELECT * FROM messages 
        WHERE conversation_id = ?
        ORDER BY created_at ASC
    `);
    return stmt.all(conversationId);
}

/**
 * Save a message to a conversation
 */
function saveMessage(conversationId, role, content, attachment = null, imageData = null, mimeType = null) {
    const id = generateId();
    const stmt = db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, attachment, image_data, mime_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(id, conversationId, role, content, attachment, imageData, mimeType);

    // Update conversation's updated_at timestamp
    db.prepare(`UPDATE conversations SET updated_at = datetime('now') WHERE id = ?`).run(conversationId);

    // Title generation is now handled by AI after the first assistant response

    return { id, conversation_id: conversationId, role, content, created_at: new Date().toISOString() };
}

/**
 * Close the database connection
 */
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = {
    initDatabase,
    createConversation,
    getConversations,
    getConversation,
    updateConversationTitle,
    deleteConversation,
    getMessages,
    saveMessage,
    closeDatabase,
};
