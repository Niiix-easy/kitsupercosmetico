import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { REVIEWS_DATA } from '../data/productData';
import { Star, CheckCircle, ThumbsUp, Camera, MessageSquarePlus, Filter, X, Award, Share2, MessageCircle, Copy, Check } from 'lucide-react';
import { Review } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getWhatsAppUrl, WHATSAPP_FORMATTED } from '../data/whatsapp';

export const ReviewsSection: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'photo' | 'fiveStar' | 'pro'>('all');
  const [reviewsList, setReviewsList] = useState<Review[]>(REVIEWS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, number>>({});
  const [shareToast, setShareToast] = useState<string | null>(null);

  const showShareToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 3500);
  };

  const handleShareWhatsApp = (review?: Review) => {
    const text = review
      ? `Olha o resultado incrível que a ${review.name} teve com o Kit Super Reconstrução da Dyusar: "${review.comment}" - Veja em: ${window.location.origin}`
      : `Veja os resultados reais de Antes e Depois do Kit Super Reconstrução Dyusar: ${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareInstagram = (review?: Review) => {
    const text = review
      ? `Transformação Real Dyusar ✨ "${review.title}" por ${review.name}: ${review.comment} #DyusarCosmeticos #SuperReconstrucao`
      : `Recuperação Capilar Dyusar Haute Performance ✨ #DyusarCosmeticos #SuperReconstrucao #AntesEDepois`;
    navigator.clipboard.writeText(text);
    showShareToast('Copiado! Cole no Instagram Stories ou Direct com as hashtags Dyusar.');
  };

  // New review form state
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newHairType, setNewHairType] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const filteredReviews = reviewsList.filter((r) => {
    if (filter === 'photo') return r.hasPhoto;
    if (filter === 'fiveStar') return r.rating === 5;
    if (filter === 'pro') return r.salonProfessional;
    return true;
  });

  const handleLike = (id: string) => {
    setLikedReviews((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newComment) return;

    const newReviewItem: Review = {
      id: `rev-${Date.now()}`,
      name: newName,
      location: newCity || 'Brasil',
      hairType: newHairType || 'Cabelo Danificado',
      rating: newRating,
      date: 'Agora mesmo',
      verified: true,
      title: newTitle || 'Excelente resultado!',
      comment: newComment,
      hasPhoto: false
    };

    setReviewsList([newReviewItem, ...reviewsList]);
    setHasSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setHasSubmitted(false);
      setNewName('');
      setNewCity('');
      setNewHairType('');
      setNewTitle('');
      setNewComment('');
    }, 1500);
  };

  return (
    <section id="depoimentos" className="py-16 lg:py-24 bg-[#0c0d10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Rating Overview */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[#d4af37]">
            Avaliações Verificadas por Clientes
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 font-serif-display">
            Quem Usou, Recomenda
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-sans-body">
            Mais de 34.200 mulheres e profissionais de salão já recuperaram a saúde e o brilho dos fios com o protocolo Dyusar.
          </p>

          {/* Rating Summary Scorecard */}
          <div className="mt-8 p-6 rounded-2xl bg-[#14151b] border border-amber-500/20 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-4xl sm:text-5xl font-black text-amber-300 font-mono">4.9</span>
              <div className="flex items-center text-amber-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-400 mt-1">Classificação baseada em 1.428 avaliações</span>
            </div>

            <div className="w-full sm:w-auto flex-1 max-w-xs space-y-1.5 text-[11px] text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <span>5 ★</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[94%]" />
                </div>
                <span>94%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>4 ★</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400/80 rounded-full w-[5%]" />
                </div>
                <span>5%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>3 ★</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full w-[1%]" />
                </div>
                <span>1%</span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-400/10 border border-amber-400/40 text-amber-300 hover:bg-amber-400/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-400" />
              <span>Avaliar</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Todas ({reviewsList.length})
            </button>
            <button
              onClick={() => setFilter('fiveStar')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'fiveStar'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              5 Estrelas
            </button>
            <button
              onClick={() => setFilter('pro')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'pro'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Profissionais de Salão
            </button>
            <button
              onClick={() => setFilter('photo')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'photo'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Com Fotos
            </button>
          </div>

          {/* Social Sharing Highlight Bar */}
          <div className="mt-6 max-w-xl mx-auto p-3 rounded-xl bg-[#14151e] border border-amber-500/25 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Compartilhe esses resultados com amigas ou clientes:</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShareWhatsApp()}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleShareInstagram()}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-[#14151b] border border-amber-500/20 flex flex-col justify-between shadow-lg hover:border-amber-400/40 transition-all duration-300"
            >
              <div>
                {/* Author Info & Verified Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-400/40 shrink-0 bg-slate-800 shadow-md">
                      <img
                        src={
                          rev.id === 'rev-1' ? '/images/avatar-blonde.webp' :
                          rev.id === 'rev-2' ? '/images/avatar-salon.webp' :
                          rev.id === 'rev-3' ? '/images/avatar-brunette.webp' :
                          '/images/avatar-blonde.webp'
                        }
                        alt={rev.name}
                        loading="lazy"
                        width="44"
                        height="44"
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white leading-tight">{rev.name}</h4>
                        {rev.verified && (
                          <span title="Compra Verificada" className="inline-flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{rev.location}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
                </div>

                {/* Hair Type & Stars */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {rev.hairType}
                  </span>
                </div>

                {/* Review Title & Body */}
                <div className="mt-3">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-100 font-serif-display">
                    "{rev.title}"
                  </h5>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans-body">
                    {rev.comment}
                  </p>

                  {/* Customer Result Photo if available */}
                  {rev.hasPhoto && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-amber-500/30 shrink-0">
                        <img
                          src={rev.id === 'rev-1' ? '/images/hair-before-after-case1.webp?v=orig_v1' : '/images/hair-before-after-case2.webp?v=creative3_final'}
                          alt="Resultado de cabelo"
                          loading="lazy"
                          width="64"
                          height="64"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        <span className="text-amber-300 font-semibold block flex items-center gap-1">
                          <Camera className="w-3 h-3 text-amber-400" />
                          Foto anexada pela cliente
                        </span>
                        <span>Resultado após uso do kit</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Helpful & Share bar */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Compra Verificada
                </span>

                <div className="flex items-center gap-2">
                  {/* Share review to WhatsApp */}
                  <button
                    onClick={() => handleShareWhatsApp(rev)}
                    title="Compartilhar no WhatsApp"
                    className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>

                  {/* Share review to Instagram */}
                  <button
                    onClick={() => handleShareInstagram(rev)}
                    title="Compartilhar no Instagram"
                    className="p-1 rounded-md text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleLike(rev.id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer ml-1"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Útil ({12 + (likedReviews[rev.id] || 0)})</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Social Share Toast */}
        {shareToast && (
          <div className="fixed bottom-24 right-4 sm:right-8 z-50 bg-[#161724] border-2 border-amber-400 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2.5 max-w-sm">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-200">{shareToast}</span>
          </div>
        )}

      </div>

      {/* Modal: Write a Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#14151b] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-serif-display text-center">
              Avaliar o Kit Super Reconstrução
            </h3>
            <p className="text-xs text-slate-400 text-center mt-1">
              Compartilhe sua experiência real com outras clientes
            </p>

            {hasSubmitted ? (
              <div className="py-8 text-center text-emerald-400 animate-fadeIn">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                <h4 className="text-base font-bold text-white">Avaliação Enviada com Sucesso!</h4>
                <p className="text-xs text-slate-300 mt-1">Obrigada por confiar na Dyusar Cosméticos.</p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="mt-4 space-y-3 text-left">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Beatriz Albuquerque"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Cidade / Estado</label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Ex: São Paulo - SP"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Cabelo</label>
                    <input
                      type="text"
                      value={newHairType}
                      onChange={(e) => setNewHairType(e.target.value)}
                      placeholder="Ex: Loiro com mechas"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Sua Nota</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-amber-300 font-bold font-mono">{newRating} de 5 estrelas</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Título do seu depoimento</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Resultado surreal na primeira lavagem"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Depoimento Detalhado *</label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Conte como estava seu cabelo antes e como ele ficou após usar o Kit Dyusar..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md mt-2"
                >
                  Publicar Avaliação
                </button>

                <div className="pt-2 text-center">
                  <a
                    href={getWhatsAppUrl('Olá! Gostaria de enviar minhas fotos e depoimento de Antes e Depois do Kit Dyusar!')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:underline font-semibold"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>Ou envie fotos/vídeos pelo WhatsApp: {WHATSAPP_FORMATTED}</span>
                  </a>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
