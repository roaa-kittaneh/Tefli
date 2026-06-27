import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useVaccineStore } from '../store/useVaccineStore';
import type { Hospital } from '../types';
import { MapPin, Phone, Navigation, Building2, ShieldPlus, Filter, Search, X, Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Leaflet dynamic import (no SSR / no build-time issues)
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    L: any;
  }
}

const AMMAN_CENTER: [number, number] = [31.9454, 35.9284];
const DEFAULT_ZOOM = 11;

type FilterType = 'all' | 'Government' | 'Private';

export const HospitalMapPage: React.FC = () => {
  const { hospitals, hospitalsLoading, fetchHospitals, setActiveTab, selectedHospitalIdForMap, setSelectedHospitalIdForMap } = useVaccineStore();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [leafletReady, setLeafletReady] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Load Leaflet dynamically ───────────────────────────────────────────────
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  // ── Fetch hospital data ────────────────────────────────────────────────────
  useEffect(() => {
    if (hospitals.length === 0) {
      fetchHospitals();
    }
  }, []);

  // ── Initialize map after Leaflet loads ────────────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      center: AMMAN_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
  }, [leafletReady]);

  // ── Add / refresh markers when hospitals data or filter changes ────────────
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current || hospitals.length === 0) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filteredHospitals = hospitals.filter(h => {
      const matchesFilter = filter === 'all' || h.type === filter;
      const matchesSearch = search === '' ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        (h.address || '').toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch && h.latitude && h.longitude;
    });

    filteredHospitals.forEach(hospital => {
      const isGov = hospital.type === 'Government';
      const color = isGov ? '#16a34a' : '#2563eb';

      // Custom SVG marker icon
      const svgIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 36px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 14px;">🏥</span>
          </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([hospital.latitude, hospital.longitude], { icon: svgIcon })
        .addTo(map);

      const vaccineList = hospital.vaccines && hospital.vaccines.length > 0
        ? hospital.vaccines.map(v => `<li style="padding: 2px 0; border-bottom: 1px solid #f0f0f0;">💉 ${v.vaccineName}</li>`).join('')
        : '<li style="color:#888">لا توجد معلومات عن اللقاحات</li>';

      marker.bindPopup(`
        <div dir="rtl" style="font-family:'Cairo',sans-serif; min-width:240px; max-width:280px; padding:8px 0">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="font-size:24px">🏥</span>
            <div>
              <h3 style="margin:0;font-size:14px;font-weight:800;color:#404E3B;">${hospital.name}</h3>
              <span style="
                font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;
                background:${isGov ? '#dcfce7' : '#dbeafe'};
                color:${isGov ? '#166534' : '#1e40af'};
              ">${isGov ? '🏛️ حكومي' : '🏢 خاص'}</span>
            </div>
          </div>
          ${hospital.address ? `
            <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:6px;font-size:12px;color:#6C8480;">
              <span>📍</span><span>${hospital.address}</span>
            </div>` : ''}
          ${hospital.phone ? `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;font-size:12px;color:#6C8480;">
              <span>📞</span><span dir="ltr">${hospital.phone}</span>
            </div>` : ''}
          <div style="margin-bottom:10px;">
            <p style="font-size:11px;font-weight:700;color:#404E3B;margin-bottom:4px;">اللقاحات المتاحة:</p>
            <ul style="list-style:none;padding:0;margin:0;font-size:11px;color:#6C8480;max-height:100px;overflow-y:auto;">
              ${vaccineList}
            </ul>
          </div>
          <a href="https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}"
            target="_blank" rel="noopener noreferrer"
            style="
              display:block;text-align:center;
              background:linear-gradient(135deg,#7B9669,#6C8480);
              color:white;font-weight:700;font-size:12px;
              padding:8px;border-radius:8px;text-decoration:none;
              margin-top:4px;
            ">
            🗺️ فتح في خرائط جوجل
          </a>
        </div>
      `, { maxWidth: 300 });

      marker.on('click', () => setSelectedHospital(hospital));
      markersRef.current.push(marker);
    });

  }, [leafletReady, hospitals, filter, search]);

  // ── Focus map on selected hospital ────────────────────────────────────────
  const focusHospital = useCallback((hospital: Hospital) => {
    if (!mapInstanceRef.current || !hospital.latitude || !hospital.longitude) return;
    setSelectedHospital(hospital);
    mapInstanceRef.current.setView([hospital.latitude, hospital.longitude], 15, { animate: true });

    // Open the marker popup
    const marker = markersRef.current.find(m => {
      const ll = m.getLatLng();
      return Math.abs(ll.lat - (hospital.latitude || 0)) < 0.0001 &&
             Math.abs(ll.lng - (hospital.longitude || 0)) < 0.0001;
    });
    if (marker) marker.openPopup();
  }, []);

  // ── Auto-focus selected hospital from Calendar ──────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current || hospitals.length === 0 || selectedHospitalIdForMap === null) return;

    const hospitalToFocus = hospitals.find(h => h.id === selectedHospitalIdForMap);
    if (hospitalToFocus) {
      focusHospital(hospitalToFocus);
      // Reset selected hospital in store
      setSelectedHospitalIdForMap(null);
    }
  }, [leafletReady, hospitals, selectedHospitalIdForMap, focusHospital, setSelectedHospitalIdForMap]);

  const filteredList = hospitals.filter(h => {
    const matchesFilter = filter === 'all' || h.type === filter;
    const matchesSearch = search === '' ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.address || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const govCount = hospitals.filter(h => h.type === 'Government').length;
  const pvtCount = hospitals.filter(h => h.type === 'Private').length;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#BAC8B1]/30 px-4 md:px-8 py-4 flex-shrink-0 shadow-sm">
        <div className="max-w-full flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#404E3B] tracking-tight">
              🗺️ خريطة المستشفيات
            </h2>
            <p className="text-xs text-[#6C8480] font-medium mt-0.5">
              مستشفيات مراكز التطعيم في عمّان، الأردن
            </p>
          </div>

          {/* Stats pills */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {govCount} حكومية
            </span>
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {pvtCount} خاصة
            </span>
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="p-2 rounded-xl bg-[#BAC8B1]/20 hover:bg-[#BAC8B1]/40 text-[#404E3B] transition-all"
              title="تبديل القائمة الجانبية"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 relative">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className={`
          ${sidebarOpen ? 'w-72 min-w-[260px]' : 'w-0 min-w-0 overflow-hidden'}
          flex-shrink-0 bg-white border-l border-[#BAC8B1]/30 flex flex-col
          transition-all duration-300
          md:relative absolute top-0 bottom-0 right-0 z-20
        `}>
          <div className="p-4 flex flex-col gap-3 flex-shrink-0 border-b border-[#BAC8B1]/20">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-[#6C8480]" />
              <input
                type="text"
                placeholder="ابحث عن مستشفى..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#E6E6E6]/50 border border-[#BAC8B1]/40 rounded-xl pr-9 pl-8 py-2 text-sm text-[#404E3B] focus:outline-none focus:border-[#7B9669] transition-all"
                dir="rtl"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute top-1/2 -translate-y-1/2 left-2 text-[#6C8480] hover:text-[#404E3B]">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              {(['all', 'Government', 'Private'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${
                    filter === f
                      ? f === 'Government'
                        ? 'bg-emerald-500 text-white'
                        : f === 'Private'
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#7B9669] text-white'
                      : 'bg-[#E6E6E6]/60 text-[#6C8480] hover:bg-[#BAC8B1]/40'
                  }`}
                >
                  {f === 'all' ? 'الكل' : f === 'Government' ? 'حكومي' : 'خاص'}
                </button>
              ))}
            </div>
          </div>

          {/* Hospital list */}
          <div className="flex-1 overflow-y-auto">
            {hospitalsLoading ? (
              <div className="flex items-center justify-center h-32 gap-2 text-[#6C8480]">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">جاري التحميل...</span>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-6 text-center text-[#6C8480]">
                <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">لا توجد مستشفيات مطابقة</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#BAC8B1]/20">
                {filteredList.map(hospital => {
                  const isGov = hospital.type === 'Government';
                  const isSelected = selectedHospital?.id === hospital.id;
                  return (
                    <li key={hospital.id}>
                      <button
                        onClick={() => focusHospital(hospital)}
                        className={`w-full text-right p-4 transition-all hover:bg-[#BAC8B1]/10 ${
                          isSelected ? 'bg-[#7B9669]/10 border-r-2 border-[#7B9669]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                            ${isGov ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}
                          `}>
                            <Building2 size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-[#404E3B] leading-tight truncate">{hospital.name}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isGov ? 'text-emerald-700 bg-emerald-50' : 'text-blue-700 bg-blue-50'
                            }`}>
                              {isGov ? '🏛️ حكومي' : '🏢 خاص'}
                            </span>
                            {hospital.address && (
                              <p className="text-[11px] text-[#6C8480] mt-1 line-clamp-2 leading-relaxed">{hospital.address}</p>
                            )}
                            {hospital.phone && (
                              <p className="text-[11px] text-[#6C8480] mt-1 flex items-center gap-1">
                                <Phone size={10} />
                                <span dir="ltr">{hospital.phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ── Map container ─────────────────────────────────────────────── */}
        <div className="flex-1 relative min-w-0">
          <div ref={mapRef} className="absolute inset-0 w-full h-full" />

          {/* Loading overlay */}
          {!leafletReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#E6E6E6] z-10">
              <div className="text-center">
                <Loader2 size={40} className="mx-auto animate-spin text-[#7B9669] mb-3" />
                <p className="text-[#404E3B] font-bold">جاري تحميل الخريطة...</p>
              </div>
            </div>
          )}

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden absolute top-3 right-3 z-10 bg-white shadow-lg rounded-xl p-2.5 border border-[#BAC8B1]/30 text-[#404E3B]"
          >
            <Filter size={18} />
          </button>

          {/* Legend */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-[#BAC8B1]/30 shadow-lg flex items-center gap-4 text-xs font-bold text-[#404E3B]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              حكومي
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              خاص
            </div>
            <div className="flex items-center gap-1 text-[#6C8480] font-normal">
              <MapPin size={10} />
              عمّان، الأردن
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
