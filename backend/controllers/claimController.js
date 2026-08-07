const Claim = require('../models/Claim');
const Item = require('../models/Item');

const normalizeText = (value = '') => value.toString().trim().toLowerCase();

const calculateVerificationScore = (claim, item) => {
  const locationText = normalizeText(item?.location || '');
  const claimLocation = normalizeText(claim.lostLocation || '');
  const dateText = item?.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : '';
  const claimDate = claim.lostDate ? new Date(claim.lostDate).toISOString().slice(0, 10) : '';
  const claimTime = normalizeText(claim.lostTime || '');
  const detailText = normalizeText(claim.uniqueDetail || '');
  const additionalText = normalizeText(claim.additionalDetails || '');
  const itemDescription = normalizeText(item?.description || '');
  const itemTitle = normalizeText(item?.title || '');
  const hiddenFeature = normalizeText(item?.hiddenFeature || '');
  const hiddenContents = normalizeText(item?.hiddenContents || '');
  const privateVerificationText = `${hiddenFeature} ${hiddenContents}`;

  let score = 0;

  if (claimLocation && locationText) {
    const locationMatch = claimLocation.includes(locationText) || locationText.includes(claimLocation);
    if (locationMatch) score += 25;
  }

  if (claimDate && dateText) {
    if (claimDate === dateText) score += 20;
  } else if (claimTime) {
    score += 10;
  }

  if (detailText) {
    const detailTokens = detailText.split(/\s+/).filter(Boolean);
    const searchableText = `${itemTitle} ${itemDescription} ${privateVerificationText}`;
    const matchedTokens = detailTokens.filter((token) => searchableText.includes(token));
    if (matchedTokens.length > 0) {
      score += Math.min(35, Math.round((matchedTokens.length / Math.max(detailTokens.length, 1)) * 35));
    }
  }

  if (additionalText) {
    const additionalTokens = additionalText.split(/\s+/).filter(Boolean);
    const searchableText = `${itemTitle} ${itemDescription} ${privateVerificationText}`;
    const matchedTokens = additionalTokens.filter((token) => searchableText.includes(token));
    if (matchedTokens.length > 0) {
      score += Math.min(20, Math.round((matchedTokens.length / Math.max(additionalTokens.length, 1)) * 20));
    }
  }

  return Math.min(100, Math.max(0, score));
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Strong potential match';
  if (score >= 60) return 'Possible match';
  return 'Weak match';
};

const buildClaimPayload = (claim, item, includePrivateVerification = false) => ({
  ...claim.toObject(),
  verificationScore: claim.verificationScore,
  scoreLabel: getScoreLabel(claim.verificationScore),
  ...(includePrivateVerification
    ? {
        privateVerification: {
          hiddenFeature: item?.hiddenFeature || '',
          hiddenContents: item?.hiddenContents || ''
        }
      }
    : {}),
  item: item
    ? {
        _id: item._id,
        title: item.title,
        category: item.category,
        location: item.location,
        type: item.type,
        description: item.description,
        status: item.status,
        reportedBy: item.reportedBy,
        hasImage: !!item.imageMimeType,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    : null
});

const createClaim = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot claim your own item.' });
    }

    const existingClaim = await Claim.findOne({ item: item._id, claimant: req.user._id });
    if (existingClaim) {
      return res.status(400).json({ message: 'You already submitted a claim for this item.' });
    }

    const { lostLocation, lostDate, lostTime, uniqueDetail, additionalDetails } = req.body;

    if (!lostLocation || !uniqueDetail) {
      return res.status(400).json({ message: 'Please provide your lost location and a unique detail.' });
    }

    const claim = await Claim.create({
      item: item._id,
      claimant: req.user._id,
      reporter: item.reportedBy,
      lostLocation,
      lostDate: lostDate ? new Date(lostDate) : null,
      lostTime,
      uniqueDetail,
      additionalDetails,
      verificationScore: 0,
      status: 'pending'
    });

    const scoredClaim = await Claim.findById(claim._id).populate('item').populate('claimant', 'name email').populate('reporter', 'name email');
    const score = calculateVerificationScore(scoredClaim, scoredClaim.item);
    scoredClaim.verificationScore = score;
    await scoredClaim.save();
    await Item.findByIdAndUpdate(item._id, { status: 'claim_pending' });

    return res.status(201).json({
      message: 'Claim submitted for review.',
      claim: buildClaimPayload(scoredClaim, scoredClaim.item)
    });
  } catch (error) {
    console.error('Create claim error:', error);
    return res.status(500).json({ message: error.message });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .sort({ createdAt: -1 })
      .populate('item', 'title category location type status description createdAt updatedAt reportedBy imageMimeType')
      .populate('reporter', 'name email');

    return res.json({ claims: claims.map((claim) => buildClaimPayload(claim, claim.item)) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getReceivedClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .populate('item', 'title category location type status description createdAt updatedAt reportedBy imageMimeType hiddenFeature hiddenContents')
      .populate('claimant', 'name email');

    return res.json({ claims: claims.map((claim) => buildClaimPayload(claim, claim.item, true)) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate('item', 'title category location type status description createdAt updatedAt reportedBy imageMimeType')
      .populate('claimant', 'name email')
      .populate('reporter', 'name email');

    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const isParticipant = [claim.claimant?._id?.toString(), claim.reporter?._id?.toString()].includes(req.user._id.toString());
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this claim' });
    }

    const includePrivateVerification = req.user._id.toString() === claim.reporter?._id?.toString() || req.user.role === 'admin';
    return res.json({ claim: buildClaimPayload(claim, claim.item, includePrivateVerification) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateClaimStatus = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId).populate('item');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    if (claim.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this claim' });
    }

    claim.status = req.body.status;
    await claim.save();

    if (claim.status === 'approved') {
      await Item.findByIdAndUpdate(claim.item._id, { status: 'claim_pending' });
    } else if (claim.status === 'rejected') {
      const item = await Item.findById(claim.item._id);
      if (item && item.status === 'claim_pending') {
        await Item.findByIdAndUpdate(claim.item._id, { status: 'active' });
      }
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate('item', 'title category location type status description createdAt updatedAt reportedBy imageMimeType')
      .populate('claimant', 'name email')
      .populate('reporter', 'name email');

    return res.json({ message: 'Claim updated', claim: buildClaimPayload(updatedClaim, updatedClaim.item, true) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId).populate('item');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    if (claim.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to approve this claim' });
    }

    if (claim.status === 'approved') {
      return res.status(400).json({ message: 'Claim already approved.' });
    }

    claim.status = 'approved';
    await claim.save();
    await Item.findByIdAndUpdate(claim.item._id, { status: 'claimed' });

    const updatedClaim = await Claim.findById(claim._id)
      .populate('item', 'title category location type status description createdAt updatedAt reportedBy imageMimeType')
      .populate('claimant', 'name email')
      .populate('reporter', 'name email');

    return res.json({ message: 'Claim approved', claim: buildClaimPayload(updatedClaim, updatedClaim.item, true) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const rejectClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId).populate('item');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    if (claim.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this claim' });
    }

    if (claim.status === 'rejected') {
      return res.status(400).json({ message: 'Claim already rejected.' });
    }

    claim.status = 'rejected';
    await claim.save();
    await Item.findByIdAndUpdate(claim.item._id, { status: 'active' });

    const updatedClaim = await Claim.findById(claim._id)
      .populate('item', 'title category location type status description createdAt updatedAt reportedBy imageMimeType')
      .populate('claimant', 'name email')
      .populate('reporter', 'name email');

    return res.json({ message: 'Claim rejected', claim: buildClaimPayload(updatedClaim, updatedClaim.item, true) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  getClaimById,
  approveClaim,
  rejectClaim
};
