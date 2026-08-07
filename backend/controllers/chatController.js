const Item = require('../models/Item');

let Groq;
try {
  Groq = require('groq-sdk');
} catch (e) {
  Groq = null;
  console.error('[Groq Init Error]: groq-sdk package is not installed or cannot be loaded.');
}

const CATEGORIES = [
  'Electronics',
  'Keys & Cards',
  'Bags & Backpacks',
  'Books & Notebooks',
  'Clothing & Apparel',
  'Watches & Jewelry',
  'Bottles & Flasks',
  'Documents & IDs',
  'Sports Equipment',
  'Other'
];

const LOCATIONS = [
  'Main Library',
  'Student Center / Hub',
  'Engineering Block',
  'Science Complex',
  'Auditorium',
  'Campus Cafeteria',
  'Sports Ground / Gym',
  'Hostel Complex',
  'Lecture Hall A-1',
  'Parking Lot',
  'Other Campus Location'
];

const parseJsonResponse = (content) => {
  if (!content) return null;
  try {
    const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (err) {
    console.error('[Groq JSON Parse Error]:', err.message, 'Raw Content:', content);
    return null;
  }
};

// @route POST /api/chat — Public/Protected
const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }

    const trimmedUserMsg = message.trim();

    // 1. Verify GROQ_API_KEY
    const apiKey = (process.env.GROQ_API_KEY || '').trim();
    if (!apiKey) {
      console.error('[Groq Debug Error]: GROQ_API_KEY is not defined or empty in backend/.env file!');
      return res.status(400).json({
        success: false,
        error: 'GROQ_API_KEY is missing or empty in backend/.env file. Please set GROQ_API_KEY to proceed.',
        reply: 'GROQ_API_KEY is missing in backend/.env.'
      });
    }

    if (!Groq) {
      console.error('[Groq Debug Error]: groq-sdk package is missing on backend.');
      return res.status(500).json({
        success: false,
        error: 'groq-sdk package is not available on backend.',
        reply: 'groq-sdk package missing.'
      });
    }

    // 2. Retrieve ALL items from DB (both LOST and FOUND reports)
    const allItems = await Item.find({})
      .select('-imageData')
      .sort({ createdAt: -1 });

    const validItemsMap = new Map(
      allItems.map((item) => [item._id.toString(), item])
    );

    const itemsDataset = allItems.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      description: item.description,
      category: item.category,
      location: item.location,
      type: item.type, // 'lost' or 'found'
      status: item.status, // 'active', 'pending', 'claimed', etc.
      dateReported: item.createdAt ? item.createdAt.toISOString().split('T')[0] : ''
    }));

    // 3. Initialize Groq SDK & configure model
    const groq = new Groq({ apiKey });
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    console.log(`[Groq API Call]: Invoking model "${model}" with ${itemsDataset.length} registered items (lost & found).`);

    const systemPrompt = `You are the Reclaim AI Search Assistant for a campus Lost & Found system.
Your job is to assist users looking for lost or found items by matching their natural language description against the provided dataset of registered items.

AVAILABLE CATEGORIES: ${JSON.stringify(CATEGORIES)}
AVAILABLE LOCATIONS: ${JSON.stringify(LOCATIONS)}

REGISTERED ITEMS DATASET (Includes both LOST reports and FOUND items):
${JSON.stringify(itemsDataset, null, 2)}

STRICT MATCHING RULES:
1. If the user states they LOST an item (e.g., "I lost a phone", "Looking for my black wallet"):
   - Match against items where type is "found".
   - If no matching "found" item exists, suggest filing a "lost" report (set prefillData.type = "lost").
2. If the user states they FOUND an item (e.g., "I found a watch", "Did anyone lose a keys?"):
   - Match against items where type is "lost".
   - If no matching "lost" item exists, suggest filing a "found" report (set prefillData.type = "found").
3. ONLY match against items present in the REGISTERED ITEMS DATASET above.
4. NEVER invent, hallucinate, or generate non-existent item IDs or details.
5. Be conservative. If evidence or description match is weak, say "possible match" or "potential match". NEVER state "this is definitely your item".
6. If a matched item has status 'claimed' or 'pending', explicitly state in your reply and reason that the item is currently marked as "claimed" or "pending".
7. Output MUST be strict JSON only with no conversational text outside the JSON object.

REQUIRED JSON FORMAT:
{
  "reply": "Friendly response summarizing findings.",
  "matchedItemIds": ["id1", "id2"],
  "reasons": {
    "id1": "Short 1-sentence reason why this item is a possible match."
  },
  "suggestReport": boolean,
  "prefillData": {
    "title": "Extracted item name/title",
    "description": "Extracted description details from user message",
    "category": "Closest matching category from the AVAILABLE CATEGORIES list",
    "location": "Closest matching location from the AVAILABLE LOCATIONS list",
    "type": "lost or found based on user intent"
  }
}`;

    const formattedHistory = history.map((h) => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: String(h.content || '')
    }));

    let response;
    try {
      response = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedHistory,
          { role: 'user', content: trimmedUserMsg }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });
    } catch (groqErr) {
      console.error('[Groq API Error Console Log]:', {
        status: groqErr.status,
        message: groqErr.message,
        name: groqErr.name,
        errorDetails: groqErr.error || groqErr
      });

      return res.status(500).json({
        success: false,
        error: `Groq API Error (${groqErr.status || 500}): ${groqErr.message || 'Failed to communicate with Groq API'}`,
        modelUsed: model
      });
    }

    const rawContent = response.choices[0]?.message?.content || '';
    console.log('[Groq Response Received]:', rawContent);

    const parsedData = parseJsonResponse(rawContent);

    if (!parsedData) {
      return res.status(200).json({
        success: true,
        reply: "I scanned our ledger but couldn't verify a direct match. Would you like to file a report?",
        matchedItemIds: [],
        matchedItems: [],
        suggestReport: true,
        prefillData: {
          title: trimmedUserMsg.slice(0, 50),
          description: trimmedUserMsg,
          category: 'Other',
          location: 'Main Library',
          type: 'lost'
        }
      });
    }

    // 4. Strict AI ID Validation
    const rawMatchedIds = Array.isArray(parsedData.matchedItemIds)
      ? parsedData.matchedItemIds
      : [];

    const validatedMatchedItems = [];
    const validatedMatchedIds = [];

    for (const rawId of rawMatchedIds) {
      if (typeof rawId === 'string' && validItemsMap.has(rawId)) {
        const itemObj = validItemsMap.get(rawId).toObject();
        itemObj.hasImage = !!itemObj.imageMimeType;
        delete itemObj.imageData;

        const reason = parsedData.reasons && parsedData.reasons[rawId]
          ? parsedData.reasons[rawId]
          : 'Possible match based on your description.';

        itemObj.matchReason = reason;
        validatedMatchedItems.push(itemObj);
        validatedMatchedIds.push(rawId);
      } else {
        console.warn(`[Groq ID Validation Warning]: AI returned unverified or non-existent ID "${rawId}" — stripped.`);
      }
    }

    const suggestReport = Boolean(parsedData.suggestReport || validatedMatchedIds.length === 0);

    const rawPrefill = parsedData.prefillData || {};
    const sanitizedPrefill = {
      title: rawPrefill.title || trimmedUserMsg.slice(0, 50),
      description: rawPrefill.description || trimmedUserMsg,
      category: CATEGORIES.includes(rawPrefill.category) ? rawPrefill.category : 'Other',
      location: LOCATIONS.includes(rawPrefill.location) ? rawPrefill.location : 'Main Library',
      type: ['lost', 'found'].includes(rawPrefill.type) ? rawPrefill.type : 'lost'
    };

    return res.status(200).json({
      success: true,
      reply: parsedData.reply || (validatedMatchedIds.length > 0 ? "I found possible matches in our registry:" : "No direct matches found in our register."),
      matchedItemIds: validatedMatchedIds,
      matchedItems: validatedMatchedItems,
      suggestReport,
      prefillData: sanitizedPrefill
    });

  } catch (err) {
    console.error('[Chat Controller Fatal Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  }
};

module.exports = {
  handleChat
};
