const items = [
  {
    id: 1,
    title: "Apple iPhone 15",
    category: "Electronics",
    description: "A lost smartphone with a bright display and excellent camera.",
    locationHint: "Found near the cafeteria",
  },
  {
    id: 2,
    title: "Samsung Galaxy Book",
    category: "Laptops",
    description: "A slim laptop that could belong to a student or office worker.",
    locationHint: "Found in the library",
  },
  {
    id: 3,
    title: "Sony WH-1000XM5",
    category: "Audio",
    description: "Noise-cancelling headphones often misplaced in lounges or transit.",
    locationHint: "Found in the waiting area",
  },
  {
    id: 4,
    title: "Nike Air Max",
    category: "Fashion",
    description: "Running shoes with a modern design that may have been left behind.",
    locationHint: "Found near the gym",
  },
  {
    id: 5,
    title: "Levi's Jeans",
    category: "Fashion",
    description: "Classic denim pants often left in changing rooms or seats.",
    locationHint: "Found in the auditorium",
  },
  {
    id: 6,
    title: "KitchenAid Mixer",
    category: "Home",
    description: "A durable kitchen appliance that may have been misplaced during travel.",
    locationHint: "Found in the storage room",
  },
  {
    id: 7,
    title: "Dell Inspiron Laptop",
    category: "Laptops",
    description: "A reliable laptop that may belong to someone working on campus.",
    locationHint: "Found in the study hall",
  },
  {
    id: 8,
    title: "Canon EOS R50",
    category: "Camera",
    description: "A compact camera often left behind by travelers and creators.",
    locationHint: "Found at the entrance desk",
  },
];

function normalize(text) {
  return text.toLowerCase().trim();
}

function getRelevantItems(req, res) {
  const query = (req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({
      message: "Search query is required",
      items: [],
    });
  }

  const normalizedQuery = normalize(query);
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  const scoredItems = items
    .map((item) => {
      const haystack = `${item.title} ${item.description} ${item.category} ${item.locationHint}`.toLowerCase();
      let score = 0;

      if (haystack.includes(normalizedQuery)) {
        score += 25;
      }

      if (item.title.toLowerCase().includes(normalizedQuery)) {
        score += 20;
      }

      queryTerms.forEach((term) => {
        if (item.title.toLowerCase().includes(term)) {
          score += 12;
        }
        if (item.description.toLowerCase().includes(term)) {
          score += 6;
        }
        if (item.category.toLowerCase().includes(term)) {
          score += 8;
        }
        if (item.locationHint.toLowerCase().includes(term)) {
          score += 4;
        }
        if (haystack.includes(term)) {
          score += 3;
        }
      });

      return { ...item, relevanceScore: score, matchType: score >= 30 ? "High match" : "Possible match" };
    })
    .filter((item) => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);

  return res.status(200).json({
    query,
    message: "Here are the most relevant lost-item matches",
    items: scoredItems,
  });
}

module.exports = { getRelevantItems };
