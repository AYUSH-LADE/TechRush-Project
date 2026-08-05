import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tag, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { getImageUrl } from '../utils/getImageUrl';

const ItemCard = ({ item }) => {
  const { _id, id, title, category, location, type, status, imageUrl, image } = item;
  const itemId = _id || id;
  const imageSrc = imageUrl || image || null;
  const isClaimed = status === 'claimed';
  const isLost = type === 'lost';

  return (
    <Link
      to={`/items/${itemId}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        {imageSrc ? (
          <img
            src={getImageUrl(imageSrc)}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Image Fallback */}
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${
            isLost ? 'from-amber-50 to-orange-100 text-amber-600' : 'from-emerald-50 to-teal-100 text-emerald-600'
          } ${imageSrc ? 'hidden' : 'flex'}`}
        >
          {isLost ? <HelpCircle className="w-12 h-12 stroke-[1.5]" /> : <ShieldCheck className="w-12 h-12 stroke-[1.5]" />}
          <span className="text-xs font-semibold uppercase tracking-wider mt-2 opacity-75">
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${
              isLost
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {type || 'Item'}
          </span>

          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full border backdrop-blur-md ${
              isClaimed
                ? 'bg-slate-900/80 text-slate-200 border-slate-700'
                : 'bg-white/90 text-blue-700 border-blue-100 font-semibold'
            }`}
          >
            {isClaimed ? 'Claimed' : 'Active'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2">
            <Tag className="w-3.5 h-3.5" />
            <span className="truncate">{category || 'General'}</span>
          </div>

          <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{location || 'Campus'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-blue-600">
          <span>View Details</span>
          <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
