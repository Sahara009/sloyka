const defaultItems = ["десертные столики", "подставки для тортов", "стенды для маркетов", "собери свою комбинацию", "25 цветов", "вафельный декор"];

/** Бегущая строка, как у Puzzle Pantry */
export function Ticker({ items = defaultItems, tone = "choc" }: { items?: string[]; tone?: "choc" | "blue" }) {
  const row = [...items, ...items, ...items];
  return (
    <div className={`ticker ticker--${tone}`} aria-hidden>
      <div className="ticker__track">
        {[0, 1].map((k) => (
          <div className="ticker__row" key={k}>
            {row.map((t, i) => (
              <span key={i}>
                {t} <i>✿</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
