import { ArrowUpRight, Leaf } from '@phosphor-icons/react';
import { type CSSProperties, useState } from 'react';
import type { PageData } from '../../api/src/cafes/cafe.schema';
import { PitchBar, useInView, useMenuTabs, useNow } from './CafePage';
import { formatPrice, textOn, waLink } from './format';
import { DAY_KEYS, DAY_LABELS, WEEK_ORDER, formatTime, jakartaClock, openStatus, statusText } from './hours';
import './pagi.css';

const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' };
const num = (i: number) => String(i + 1).padStart(2, '0');

/** Layout "pagi": white panels on warm beige, a thin oversized serif cropped by the panel edge, one accent colour. */
export function PagiPage({ data }: { data: PageData }) {
  const { cafe, slug, pitch } = data;
  const [category, setCategory] = useState(0);
  const [heroActions, heroActionsVisible] = useInView<HTMLDivElement>();
  const { tabs, onKeyDown } = useMenuTabs(cafe.menu.length, category, setCategory);
  const now = useNow();
  const status = openStatus(cafe.hours, now);
  const today = DAY_KEYS[jakartaClock(now).day];

  const photo = (file: string) => `/media/${slug}/${file}`;
  const orderLink = waLink(cafe.contact.whatsapp, cafe.contact.whatsappText ?? `Halo ${cafe.name}, saya mau pesan:`);
  const instagram = cafe.contact.instagram && `https://instagram.com/${cafe.contact.instagram}`;
  // The last word of the name is the oversized one; the words before it sit above it.
  const words = cafe.name.split(/\s+/);
  const last = words[words.length - 1];
  const lead = words.slice(0, -1).join(' ');
  const firstOpen = WEEK_ORDER.map((d) => cafe.hours[d]).find((h) => h !== null);
  const statusLine = status.open ? `Buka sampai ${formatTime(status.until)}` : statusText(status).detail;
  const style = {
    '--last-len': last.length,
    ...(cafe.accent && { '--accent': cafe.accent, '--on-accent': textOn(cafe.accent) }),
  } as CSSProperties;

  return (
    <div className="pagi" style={style}>
      {pitch && <PitchBar cafeName={cafe.name} pitch={pitch} />}

      <section className="pg-hero" aria-labelledby="cafe-name">
        <div className="pg-side">
          <a className="pg-logo" href="#" aria-label={`${cafe.name}, ke atas`}>
            <Leaf size={34} weight="thin" aria-hidden />
            <span className="pg-logo-a">{words[0]}</span>
            {words.length > 1 && <span className="pg-logo-b">{words.slice(1).join(' ')}</span>}
          </a>
          <nav aria-label="Bagian halaman" className="pg-nav">
            <a href="#menu">Menu</a>
            <a href="#suasana">Suasana</a>
            <a href="#lokasi">Lokasi</a>
          </nav>
          <div className="pg-side-foot">
            <p className="pg-note">
              {cafe.specialty}
              {cafe.since && `, sejak ${cafe.since}`}
              <br />
              {cafe.area} / {cafe.city}
            </p>
            <p className="pg-status">
              <span className={`dot ${status.open ? 'dot-open' : ''}`} aria-hidden />
              {statusLine}
            </p>
            <div className="pg-cta" ref={heroActions}>
              <a className="pg-bar" href={orderLink} {...NEW_TAB}>
                Pesan via WhatsApp
              </a>
              {cafe.memberUrl && (
                <a className="pg-bar pg-bar-line" href={cafe.memberUrl} {...NEW_TAB}>
                  Member
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="pg-hero-photo">
          <img src={photo(cafe.photos.hero)} alt={`Menu andalan ${cafe.name}`} width={900} height={1200} fetchPriority="high" />
        </div>
        <h1 id="cafe-name" className="pg-name">
          {lead && <span className="pg-name-lead">{lead} </span>}
          <span className="pg-name-last">{last}</span>
        </h1>
      </section>

      <main className="pg-main">
        <section className="pg-panel" aria-labelledby="best-title">
          <span className="pg-ghost" aria-hidden>
            Favorit
          </span>
          <h2 id="best-title" className="pg-h2">
            Paling dicari
          </h2>
          <ul className="pg-products">
            {cafe.bestSellers.map((b, i) => (
              <li key={b.name}>
                <span className="pg-idx" aria-hidden>
                  {num(i)}
                </span>
                <img src={photo(b.photo)} alt={b.name} width={800} height={800} loading="lazy" />
                <h3>{b.name}</h3>
                <p className="price">{formatPrice(b.price)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="suasana" className="pg-split" aria-labelledby="suasana-title">
          <div className="pg-split-photo">
            <img
              src={photo(cafe.photos.atmosphere)}
              alt={`Suasana di dalam ${cafe.name}`}
              width={1200}
              height={1500}
              loading="lazy"
            />
            {cafe.since && (
              <span className="pg-numeral" aria-hidden>
                {cafe.since}
              </span>
            )}
          </div>
          <div className="pg-split-text">
            <h2 id="suasana-title" className="pg-h2">
              {cafe.atmosphere.title}
            </h2>
            <p className="pg-lead">{cafe.atmosphere.text}</p>
            <ul className="pg-steps">
              {[...cafe.facilities, { title: statusText(status).title, note: statusText(status).detail }].map((f, i) => (
                <li key={f.title}>
                  <span className="pg-step-num" aria-hidden>
                    {num(i)}
                  </span>
                  <span className="pg-step-text">
                    <strong>{f.title}</strong>
                    {f.note}
                  </span>
                </li>
              ))}
            </ul>
            <div className="pg-stamped">
              <svg className="pg-stamp" width="92" height="92" viewBox="0 0 92 92" aria-hidden>
                <circle cx="46" cy="46" r="45" className="pg-stamp-disc" />
                <circle cx="46" cy="46" r="44.5" fill="none" stroke="currentColor" />
                <path id="pg-stamp-path" d="M13 46a33 33 0 1 1 66 0a33 33 0 1 1-66 0" fill="none" />
                {/* textLength spreads any cafe name around the full circle. */}
                <text fontSize="8.5" fontWeight="600" fill="currentColor">
                  <textPath href="#pg-stamp-path" textLength="200" lengthAdjust="spacing">
                    {`${cafe.name} · ${cafe.since ? `sejak ${cafe.since}` : cafe.city} ·`.toUpperCase()}
                  </textPath>
                </text>
              </svg>
              <Leaf className="pg-stamp-leaf" size={26} weight="thin" aria-hidden />
              <a className="pg-bar" href={orderLink} {...NEW_TAB}>
                Pesan via WhatsApp
              </a>
            </div>
          </div>
        </section>

        {cafe.photos.gallery.length > 0 && (
          <div className="pg-gallery" style={{ gridTemplateColumns: `repeat(${cafe.photos.gallery.length}, minmax(0, 1fr))` }}>
            {cafe.photos.gallery.map((g, i) => (
              <img key={g} src={photo(g)} alt={`Sudut ${cafe.name}, foto ${i + 1}`} width={800} height={800} loading="lazy" />
            ))}
          </div>
        )}

        <section id="menu" className="pg-panel" aria-labelledby="menu-title">
          <span className="pg-ghost" aria-hidden>
            {cafe.menu[category].category}
          </span>
          <h2 id="menu-title" className="pg-h2">
            Menu
          </h2>
          <div className="pg-tabs" role="tablist" aria-label="Kategori menu" onKeyDown={onKeyDown}>
            {cafe.menu.map((m, i) => (
              <button
                key={m.category}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${i}`}
                aria-selected={i === category}
                aria-controls="menu-panel"
                tabIndex={i === category ? 0 : -1}
                className="pg-tab"
                onClick={() => setCategory(i)}
              >
                {m.category}
              </button>
            ))}
          </div>
          <ul id="menu-panel" role="tabpanel" aria-labelledby={`tab-${category}`} className="pg-list">
            {cafe.menu[category].items.map((item, i) => (
              <li key={item.name}>
                <span className="pg-step-num" aria-hidden>
                  {num(i)}
                </span>
                <span className="pg-step-text">
                  <strong>{item.name}</strong>
                  {item.note}
                </span>
                <span className="price">{formatPrice(item.price)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="lokasi" className="pg-split pg-split-rev" aria-labelledby="lokasi-title">
          <div className="pg-split-text">
            <h2 id="lokasi-title" className="pg-h2">
              Mampir ke {cafe.area}
            </h2>
            <address className="pg-lead">{cafe.address}</address>
            <table className="pg-hours">
              <caption className="sr-only">Jam buka per hari</caption>
              <tbody>
                {WEEK_ORDER.map((d) => {
                  const h = cafe.hours[d];
                  return (
                    <tr key={d} className={d === today ? 'is-today' : undefined}>
                      <th scope="row">
                        {DAY_LABELS[d]}
                        {d === today && ' (hari ini)'}
                      </th>
                      <td>{h ? `${formatTime(h.open)} - ${formatTime(h.close)}` : 'Tutup'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <a className="pg-bar pg-bar-wide" href={cafe.mapsUrl} {...NEW_TAB}>
              Buka di Google Maps
              <ArrowUpRight size={16} aria-hidden />
            </a>
          </div>
          <div className="pg-split-photo">
            <img src={photo(cafe.photos.location)} alt={`Tampak ${cafe.name}`} width={1200} height={900} loading="lazy" />
            {firstOpen && (
              <span className="pg-numeral" aria-hidden>
                {formatTime(firstOpen.open)}
              </span>
            )}
          </div>
        </section>
      </main>

      <footer className="pg-footer">
        <div>
          <p className="pg-footer-mark">{cafe.name}</p>
          <p className="pg-credit">
            © {now.getFullYear()} {cafe.name}
            {pitch && ` · Contoh website oleh ${pitch.name}`}
          </p>
        </div>
        <ul className="pg-footer-links">
          {instagram && (
            <li>
              <a href={instagram} {...NEW_TAB}>
                Instagram
              </a>
            </li>
          )}
          <li>
            <a href={orderLink} {...NEW_TAB}>
              WhatsApp
            </a>
          </li>
          {cafe.contact.gofood && (
            <li>
              <a href={cafe.contact.gofood} {...NEW_TAB}>
                GoFood
              </a>
            </li>
          )}
          {cafe.contact.grabfood && (
            <li>
              <a href={cafe.contact.grabfood} {...NEW_TAB}>
                GrabFood
              </a>
            </li>
          )}
        </ul>
      </footer>

      <div className="order-bar" data-hidden={heroActionsVisible}>
        <a className="pg-bar" href={orderLink} {...NEW_TAB} tabIndex={heroActionsVisible ? -1 : undefined}>
          Pesan via WhatsApp
        </a>
      </div>
    </div>
  );
}
