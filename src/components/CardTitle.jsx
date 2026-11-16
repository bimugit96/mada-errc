import Icon from './Icons.jsx';

/**
 * Tajuk kad dashboard — lencana ikon emas + tajuk + kandungan
 * pilihan di sebelah kanan (penapis, tab, dsb.).
 */
export default function CardTitle({ icon = 'sprout', children, right = null }) {
  return (
    <div className="card-titlebar">
      <h3 className="card-heading">
        <span className="title-badge">
          <Icon name={icon} />
        </span>
        {children}
      </h3>
      {right}
    </div>
  );
}
