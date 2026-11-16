/**
 * ============================================================
 *  HOOK - MUAT NAIK FAIL EXCEL (MODUL PERBELANJAAN)
 * ============================================================
 * Sifat:
 *   1. Pengguna memilih fail .xlsx / .xls daripada komputer.
 *   2. Fail dibaca di dalam pelayar (SheetJS) - tiada fail dihantar
 *      ke pelayan, tiada sambungan luar.
 *   3. Helaian yang mengandungi data perbelanjaan dikesan
 *      secara automatik.
 *   4. Data yang berjaya dibaca disimpan; ralat jelas dipaparkan
 *      jika format fail tidak sesuai.
 *   5. Status: idle -> reading -> ready | error
 * ============================================================
 */
import { useCallback, useState } from 'react';
import {
  readPerbelanjaanFile,
  readPerbelanjaanWorkbook,
  ExcelReadError,
} from '../utils/perbelanjaanExcel.js';

export const STATUS = {
  IDLE: 'idle',
  READING: 'reading',
  READY: 'ready',
  ERROR: 'error',
};

/**
 * @returns {{
 *   status: string,
 *   model: object|null,
 *   error: {message:string, hint:string|null, code:string}|null,
 *   fileName: string|null,
 *   uploadedAt: Date|null,
 *   sheetName: string|null,
 *   handleFile: (file:File|null|undefined) => Promise<void>,
 *   loadBuffer: (buffer:ArrayBuffer, fileName:string) => Promise<void>,
 *   reset: () => void,
 * }}
 */
export default function usePerbelanjaanExcel() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedAt, setUploadedAt] = useState(null);

  const applyModel = useCallback((result) => {
    setModel(result);
    setUploadedAt(new Date(result.file.uploadedAt));
    setError(null);
    setStatus(STATUS.READY);
  }, []);

  const handleFailure = useCallback((err) => {
    setModel(null);
    setUploadedAt(null);
    if (err instanceof ExcelReadError) {
      setError({ message: err.message, hint: err.hint, code: err.code });
    } else {
      setError({
        message: `Fail tidak dapat diproses: ${err?.message || err}`,
        hint: null,
        code: 'UNKNOWN',
      });
    }
    setStatus(STATUS.ERROR);
  }, []);

  /** Muat naik fail yang dipilih pengguna (browser File API). */
  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setStatus(STATUS.READING);
      setError(null);
      try {
        const result = await readPerbelanjaanFile(file);
        applyModel(result);
      } catch (err) {
        handleFailure(err);
      }
    },
    [applyModel, handleFailure],
  );

  /**
   * Muat naik daripada ArrayBuffer - digunakan oleh ujian
   * (bukan browser File API).
   */
  const loadBuffer = useCallback(
    async (buffer, fileName) => {
      setStatus(STATUS.READING);
      setError(null);
      try {
        const result = await readPerbelanjaanWorkbook(buffer, fileName);
        applyModel(result);
      } catch (err) {
        handleFailure(err);
      }
    },
    [applyModel, handleFailure],
  );

  /** Buang data semasa dan kembali ke keadaan awal. */
  const reset = useCallback(() => {
    setModel(null);
    setError(null);
    setUploadedAt(null);
    setStatus(STATUS.IDLE);
  }, []);

  return {
    status,
    model,
    error,
    uploadedAt,
    fileName: model?.file?.name ?? null,
    sheetName: model?.file?.sheetName ?? null,
    handleFile,
    loadBuffer,
    reset,
  };
}
