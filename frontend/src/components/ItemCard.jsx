import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tag as TagIcon, ArrowRight, HelpCircle, ShieldCheck } from 'lucide-react';
import { getImageUrl } from '../utils/getImageUrl';

const ItemCard = ({ item }) => {
  const { _id, id, title, category, location, type, status } = item;
  const itemId = _id || id;
  const isClaimed = status === 'claimed';
  const isLost = type === 'lost';
  const hasImage = !!item.hasImage;
  const imageSrc = hasImage ? itemId : null;

  return (
    <Link
      to={`/items/${itemId}`}
      className="group bg-[#F2F0EF] border border-[#898989] hover:border-[#4B6E48] transition-all duration-300 relative tag-notch-tr flex flex-col h-full overflow-hidden text-[#333333]"
    >
      {/* Decorative tag punch hole */}
      <div className="absolute top-[8px] right-[8px] w-4 h-4 rounded-full bg-[#F2F0EF] border border-[#898989] flex items-center justify-center z-30">
        <div className="w-1.5 h-1.5 rounded-full bg-[#898989] group-hover:bg-[#4B6E48] transition-colors" />
      </div>

      {/* Decorative tag string */}
      <div className="absolute -top-3 right-[18px] w-[1px] h-6 bg-[#898989] group-hover:bg-[#4B6E48] rotate-[25deg] origin-bottom z-20 pointer-events-none transition-colors" />

      {/* Image Container */}
      <div className="relative aspect-4/3 bg-[#E5E2E0] border-b border-[#898989] overflow-hidden flex items-center justify-center">
        {imageSrc ? (
          <img
            src={getImageUrl(imageSrc)}
            alt={title}
            className="w-full h-full object-cover grayscale-25 group-hover:grayscale-0 transition-all duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}

        {/* Image Fallback */}
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-[#E5E2E0] text-[#898989] ${
            imageSrc ? 'hidden' : 'flex'
          }`}
        >
          {isLost ? <HelpCircle className="w-10 h-10 stroke-[1.2]" /> : <ShieldCheck className="w-10 h-10 stroke-[1.2]" />}
        </div>

        {/* Ink Stamps Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start pointer-events-none z-10">
          <span className={`ink-stamp ${isLost ? 'ink-stamp-lost -rotate-6' : 'ink-stamp-found rotate-3'}`}>
            {type || 'Item'}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 pointer-events-none z-10">
          <span
            className={`ink-stamp ${
              isClaimed
                ? 'ink-stamp-claimed rotate-2'
                : status === 'pending'
                ? 'ink-stamp-pending -rotate-3'
                : 'ink-stamp-found rotate-6'
            }`}
          >
            {isClaimed ? 'Claimed' : status === 'pending' ? 'Pending' : 'Active'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Monospace Category tag */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#898989] mb-1.5">
            <TagIcon className="w-3 h-3 text-[#B2AC88]" />
            <span className="truncate uppercase tracking-wider">{category || 'General'}</span>
          </div>

          {/* Slab serif Heading */}
          <h3 className="font-serif font-bold text-[#333333] text-lg leading-tight group-hover:text-[#4B6E48] transition-colors line-clamp-2 mb-2">
            {title}
          </h3>

          {/* Monospace Location */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#898989] mb-4">
            <MapPin className="w-3 h-3 text-[#B2AC88] shrink-0" />
            <span className="truncate">{location || 'Campus'}</span>
          </div>
        </div>

        {/* Footer (Ledger-style) */}
        <div className="pt-2.5 border-t border-dashed border-[#898989] flex items-center justify-between text-xs font-mono text-[#898989] group-hover:text-[#4B6E48] transition-colors">
          <span className="uppercase tracking-wider">LOG_REF_{itemId.slice(-6).toUpperCase()}</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold">Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;