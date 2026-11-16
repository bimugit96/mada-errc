/**
 * ============================================================
 *  METER BULAT — KPI BILANGAN USAHAWAN (halaman Ringkasan)
 * ============================================================
 *  Empat KPIilés sebagai meter bulat separa (250°), mengikut
 *  reka bentuk rujukan: cincin berwarna, ikon besar di dalam,
 *  label dan angka utama di tengah.
 *
 *  Data datang daripada `viewModel.kpis` — tiada angka hardcode.
 * ============================================================
 */
import Icon from './Icons.jsx';

/** Warna meter mengikut urutan KPI (hijau gelap, hijau terang, emas, kelabu). */
const GAUGE_COLORS = ['#175C36', '#7CB518', '#F5B82E', '#BCC5CC'];

/* Geometri meter (viewBox 0 0 200 200) */
const R = 78; // jejari
const SWEEP = 250; // sudut busur (darjah)
const START = 145; // busur bermula (bawah kiri)
const CIRC = 2 * Math.PI * R;
const ARC_LEN = (SWEEP / 360) * CIRC;
const END_ANGLE = ((START + SWEEP) % 360) * (Math.PI / 180);
const DOT_X = 100 + R * Math.cos(END_ANGLE);
const DOT_Y = 100 + R * Math.sin(END_ANGLE);

export default function ExecUsahawanGauges({ kpis }) {
  if (!kpis || kpis.length === 0) return null;

  return (
    <div className="exec-gauges">
      {kpis.map((k, i) => {
        const color = GAUGE_COLORS[i % GAUGE_COLORS.length];
        return (
          <div className="exec-gauge" key={k.id}>
            <div className="exec-gauge-ring" style={{ '--gauge-color': color }}>
              <svg viewBox="0 0 200 200" className="exec-gauge-svg" aria-hidden="true">
                <circle
                  className="exec-gauge-track"
                  cx="100"
                  cy="100"
                  r={R}
                  fill="none"
                  strokeWidth="17"
                  strokeDasharray={`${ARC_LEN} ${CIRC - ARC_LEN}`}
                  strokeLinecap="round"
                  transform={`rotate(${START} 100 100)`}
                />
                <circle
                  className="exec-gauge-arc"
                  cx="100"
                  cy="100"
                  r={R}
                  fill="none"
                  stroke="var(--gauge-color)"
                  strokeWidth="17"
                  strokeDasharray={`${ARC_LEN} ${CIRC - ARC_LEN}`}
                  strokeLinecap="round"
                  transform={`rotate(${START} 100 100)`}
                />
                <circle
                  className="exec-gauge-dot"
                  cx={DOT_X}
                  cy={DOT_Y}
                  r="9.5"
                  fill="var(--gauge-color)"
                  stroke="#ffffff"
                  strokeWidth="3"
                />
              </svg>

              <div className="exec-gauge-inner">
                <span className="exec-gauge-icon">
                  <Icon name={k.icon || 'users'} />
                </span>
                <div className="exec-gauge-label">{k.label}</div>
                <div className="exec-gauge-value">{k.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
