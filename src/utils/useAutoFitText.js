/**
 * ============================================================
 *  HOOK — AUTO-FIT TEXT
 *  Menyesuaikan saiz font secara AUTOMATIK supaya teks panjang
 *  (contoh: "RM 111,690,242") sentiasa muat sepenuhnya dalam
 *  kad — TANPA memotong, TANPA ellipsis, tanpa menyembunyikan
 *  mana-mana digit.
 *
 *  Prinsip:
 *   1. CSS menetapkan saiz asas responsif (clamp / container query).
 *   2. Hook ini mengukur lebar teks SEBENAR pada saiz asas.
 *   3. Jika melimpah, hook menetapkan faktor penskalaan
 *      `--<scaleVar>` (nilai 0–1) — CSS menggandakannya dengan
 *      saiz asas. Zah/asas kekal dari CSS, hook hanya MENGEKURANGKAN.
 *   4. Pengukuran diulang apabila saiz kad / tetingkap berubah
 *      (ResizeObserver + event resize) dan selepas webfont dimuatkan.
 *
 *  Jika teks masih tidak muat pada saiz minimum, hook menandakan
 *  `data-fit="tight"` supaya CSS membolehkan pembalutan baris
 *  (tijdak ada digit yang dipotong atau disembunyikan).
 * ============================================================
 */
import { useCallback, useEffect, useRef } from 'react';

/** Saiz font minimum (px) — masih boleh dibaca dengan selesa. */
const DEFAULT_MIN_FONT_PX = 9.5;

/**
 * @param {object}   options
 * @param {string}   options.scaleVar  Nama CSS custom property untuk faktor skala.
 * @param {number}   options.minFontPx Saiz font minimum dalam px.
 * @returns {import('react').RefObject<HTMLElement>} ref untuk dipasang pada elemen.
 */
export default function useAutoFitText({
  scaleVar = '--fit-scale',
  minFontPx = DEFAULT_MIN_FONT_PX,
} = {}) {
  const ref = useRef(null);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // 1) kembali kepada saiz asas (CSS clamp / container query)
    el.style.setProperty(scaleVar, '1');
    el.dataset.fit = '';
    void el.offsetWidth; // paksa reflow supaya ukuran dibaca selepas perubahan

    const cs = getComputedStyle(el);
    const base = parseFloat(cs.fontSize);
    if (!base || !Number.isFinite(base)) return;

    const avail =
      el.clientWidth -
      (parseFloat(cs.paddingLeft) || 0) -
      (parseFloat(cs.paddingRight) || 0);
    if (!(avail > 0)) return;

    // 2) ukur lebar teks sebenar pada saiz asas
    let natural = 0;
    if (typeof document.createRange === 'function') {
      const range = document.createRange();
      range.selectNodeContents(el);
      natural = range.getBoundingClientRect().width;
    }
    if (!natural) natural = el.scrollWidth;
    if (!natural) return;

    // 3) muat? biarkan saiz asas digunakan
    if (natural <= avail) return;

    // 4) kecilkan saiz font secara berkadar (lebar teks linear dgn font-size)
    const target = Math.max(minFontPx, (avail * base) / natural);
    const scale = Math.max(0.4, Math.min(1, target / base));
    el.style.setProperty(scaleVar, String(scale));

    // 5) masih melimpah pada saiz minimum? benarkan pembalutan baris
    //    (semua digit kekal kelihatan — tiada ellipsis / tiada potong)
    if (scale <= 0.4 + 1e-6 || target <= minFontPx) {
      const after = el.scrollWidth;
      if (after > avail) el.dataset.fit = 'tight';
    }
  }, [scaleVar, minFontPx]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    fit();

    // Webfont (Plus Jakarta Sans) mungkin dimuatkan selepas render awal.
    const raf = requestAnimationFrame(fit);
    const timer = setTimeout(fit, 600);

    // Ikut perubahan saiz kad (grid responsif / saiz tetingkap).
    // Hanya lebar yang Everest — elak gelung berulang apabila
    // saiz font berubah (yang mengubah tinggi, bukan lebar).
    let lastWidth = -1;
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect?.width ?? 0;
        if (Math.abs(width - lastWidth) < 0.5) return;
        lastWidth = width;
        fit();
      });
      ro.observe(el.parentElement || el);
    }

    // Ikut perubahan TEKS (contoh: import Excel baharu => nilai berubah).
    // MutationObserver hanya-modified childList/characterData, jadi
    // perubahan style di dalam `fit()` tidak mencetuskan gelung.
    let mo;
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(() => fit());
      mo.observe(el, { childList: true, characterData: true, subtree: true });
    }

    window.addEventListener('resize', fit);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize', fit);
      if (ro) ro.disconnect();
      if (mo) mo.disconnect();
    };
  }, [fit]);

  return ref;
}
