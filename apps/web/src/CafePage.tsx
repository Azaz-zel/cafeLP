import {
  ArrowRight,
  ArrowUpRight,
  Car,
  Clock,
  Coffee,
  InstagramLogo,
  type Icon,
  Moped,
  MusicNotes,
  PawPrint,
  Plant,
  Plug,
  WifiHigh,
  X,
} from '@phosphor-icons/react';
import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import type { Cafe, PageData } from '../../api/src/cafes/cafe.schema';
import { formatPrice, textOn, waLink } from './format';
import { DAY_KEYS, DAY_LABELS, WEEK_ORDER, formatTime, jakartaClock, openStatus, statusText } from './hours';

type Facility = Cafe['facilities'][number]['icon'];
const FACILITY_ICON: Record<Facility, Icon> = {
  coffee: Coffee,
  wifi: WifiHigh,
  plug: Plug,
  delivery: Moped,
  parking: Car,
  music: MusicNotes,
  plant: Plant,
  pet: PawPrint,
};

/** Re-render every minute so "Buka sekarang" flips at closing time without a reload. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** True while the element is on screen. Starts true so the order bar never flashes in on load. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

export function CafePage({ data }: { data: PageData }) {
  const { cafe, slug, pitch } = data;
  const [category, setCategory] = useState(0);
  const [heroActions, heroActionsVisible] = useInView<HTMLDivElement>();
  const now = useNow();
  const status = openStatus(cafe.hours, now);
  const today = DAY_KEYS[jakartaClock(now).day];

  const photo = (file: string) => `/media/${slug}/${file}`;
  const orderLink = waLink(cafe.contact.whatsapp, cafe.contact.whatsappText ?? `Halo ${cafe.name}, saya mau pesan:`);
  const words = cafe.name.split(/\s+/);
  const style = {
    // The wordmark scales to the name: longest word for the stacked mobile layout, full name on one desktop line.
    '--word-len': Math.max(...words.map((w) => w.length)),
    '--name-len': cafe.name.length,
    ...(cafe.accent && { '--accent': cafe.accent, '--on-accent': textOn(cafe.accent) }),
  } as CSSProperties;

  return (
    <div className="page" style={style}>
      {pitch && <PitchBar cafeName={cafe.name} pitch={pitch} />}

      <header className="topbar wrap">
        <nav aria-label="Bagian halaman" className="topbar-nav">
          <a href="#menu">Menu</a>
          <a href="#suasana">Suasana</a>
          <a href="#lokasi">Lokasi</a>
        </nav>
        <div className="topbar-actions">
          {cafe.contact.instagram && (
            <a
              className="icon-link"
              href={`https://instagram.com/${cafe.contact.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${cafe.name}`}
            >
              <InstagramLogo size={22} weight="light" aria-hidden />
            </a>
          )}
          <a className="btn btn-solid btn-compact desktop-only" href={orderLink} target="_blank" rel="noopener noreferrer">
            Pesan via WhatsApp
          </a>
        </div>
      </header>

      <main>
        <section className="hero wrap" aria-labelledby="cafe-name">
          <h1 id="cafe-name" className="wordmark">
            {cafe.name}
          </h1>
          <div className="hero-body">
            <p className="hero-note hero-note-start">
              {cafe.specialty}
              {cafe.since && (
                <>
                  <br />
                  Sejak {cafe.since}
                </>
              )}
            </p>
            <figure className="hero-photo">
              <img
                src={photo(cafe.photos.hero)}
                alt={`Menu andalan ${cafe.name}`}
                width={900}
                height={1200}
                fetchPriority="high"
              />
            </figure>
            <div className="hero-note hero-note-end">
              <p>
                {cafe.area}
                <br />
                {cafe.city}
              </p>
              <p className="status-line">
                <span className={`dot ${status.open ? 'dot-open' : ''}`} aria-hidden />
                {status.open ? `Buka s/d ${formatTime(status.until)}` : statusText(status).detail}
              </p>
            </div>
            <div className="hero-actions" ref={heroActions}>
              <a className="btn btn-solid" href={orderLink} target="_blank" rel="noopener noreferrer">
                Pesan via WhatsApp
              </a>
              <a className="btn btn-text" href="#menu">
                Lihat menu
                <ArrowRight size={16} aria-hidden />
              </a>
            </div>
          </div>
        </section>

        <nav className="band" aria-label="Lompat ke kategori menu">
          <ul className="band-list wrap">
            {cafe.menu.map((m, i) => (
              <li key={m.category}>
                <a className="band-item" href="#menu" onClick={() => setCategory(i)}>
                  {m.photo && <img src={photo(m.photo)} alt="" width={400} height={480} loading="lazy" />}
                  <span className="band-text">
                    <span className="band-name">{m.category}</span>
                    <span className="band-cta">
                      Lihat <ArrowRight size={14} aria-hidden />
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="suasana" className="atmosphere" aria-labelledby="suasana-title">
          <div className="atmosphere-text">
            <h2 id="suasana-title" className="display">
              {cafe.atmosphere.title}
            </h2>
            <p className="lead">{cafe.atmosphere.text}</p>
          </div>
          <img
            className="atmosphere-photo"
            src={photo(cafe.photos.atmosphere)}
            alt={`Suasana di dalam ${cafe.name}`}
            width={1200}
            height={1500}
            loading="lazy"
          />
        </section>
        {cafe.photos.gallery.length > 0 && (
          <div className="gallery" data-count={cafe.photos.gallery.length}>
            {cafe.photos.gallery.map((g, i) => (
              <img key={g} src={photo(g)} alt={`Sudut ${cafe.name}, foto ${i + 1}`} width={800} height={800} loading="lazy" />
            ))}
          </div>
        )}

        <section className="facts wrap" aria-label="Info singkat">
          <ul className="facts-list">
            {cafe.facilities.map((f) => {
              const FIcon = FACILITY_ICON[f.icon];
              return (
                <li key={f.title} className="fact">
                  <FIcon size={26} weight="light" aria-hidden />
                  <span>
                    <strong>{f.title}</strong>
                    {f.note}
                  </span>
                </li>
              );
            })}
            <li className="fact">
              <Clock size={26} weight="light" aria-hidden />
              <span>
                <strong>{statusText(status).title}</strong>
                {statusText(status).detail}
              </span>
            </li>
          </ul>
        </section>

        <section className="bestsellers wrap" aria-labelledby="best-title">
          <div className="section-head">
            <h2 id="best-title" className="title-sm">
              Paling dicari
            </h2>
            <a className="text-link" href="#menu">
              Lihat menu
            </a>
          </div>
          <ul className="product-grid">
            {cafe.bestSellers.map((b) => (
              <li key={b.name} className="product">
                <img src={photo(b.photo)} alt={b.name} width={800} height={800} loading="lazy" />
                <h3>{b.name}</h3>
                <p className="price">{formatPrice(b.price)}</p>
              </li>
            ))}
          </ul>
        </section>

        <MenuSection cafe={cafe} active={category} onChange={setCategory} />

        <section id="lokasi" className="location wrap" aria-labelledby="lokasi-title">
          <div className="location-text">
            <h2 id="lokasi-title" className="display">
              Mampir ke {cafe.area}
            </h2>
            <address>{cafe.address}</address>
            <a className="btn btn-outline" href={cafe.mapsUrl} target="_blank" rel="noopener noreferrer">
              Buka di Google Maps
              <ArrowUpRight size={16} aria-hidden />
            </a>
            <table className="hours">
              <caption className="sr-only">Jam buka per hari</caption>
              <tbody>
                {WEEK_ORDER.map((d) => {
                  const h = cafe.hours[d];
                  return (
                    <tr key={d} className={d === today ? 'is-today' : undefined}>
                      <th scope="row">
                        {DAY_LABELS[d]}
                        {d === today && <span className="today-tag"> (hari ini)</span>}
                      </th>
                      <td>{h ? `${formatTime(h.open)} - ${formatTime(h.close)}` : 'Tutup'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <img
            className="location-photo"
            src={photo(cafe.photos.location)}
            alt={`Tempat duduk di ${cafe.name}`}
            width={1200}
            height={900}
            loading="lazy"
          />
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <p className="footer-mark">{cafe.name}</p>
          <ul className="footer-links">
            {cafe.contact.instagram && (
              <li>
                <a href={`https://instagram.com/${cafe.contact.instagram}`} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            )}
            <li>
              <a href={orderLink} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            {cafe.contact.gofood && (
              <li>
                <a href={cafe.contact.gofood} target="_blank" rel="noopener noreferrer">
                  GoFood
                </a>
              </li>
            )}
            {cafe.contact.grabfood && (
              <li>
                <a href={cafe.contact.grabfood} target="_blank" rel="noopener noreferrer">
                  GrabFood
                </a>
              </li>
            )}
          </ul>
          <p className="footer-credit">
            © {now.getFullYear()} {cafe.name}
            {pitch && ` · Contoh website oleh ${pitch.name}`}
          </p>
        </div>
      </footer>

      <div className="order-bar" data-hidden={heroActionsVisible}>
        <a
          className="btn btn-solid"
          href={orderLink}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={heroActionsVisible ? -1 : undefined}
        >
          Pesan via WhatsApp
        </a>
      </div>
    </div>
  );
}

function PitchBar({ cafeName, pitch }: { cafeName: string; pitch: NonNullable<PageData['pitch']> }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <aside className="pitch" aria-label="Info demo">
      <div className="wrap pitch-inner">
        <p>
          Contoh website untuk {cafeName}, dibuat oleh {pitch.name}.
        </p>
        <a href={waLink(pitch.whatsapp, `Halo, saya lihat contoh website untuk ${cafeName}.`)} target="_blank" rel="noopener noreferrer">
          Chat saya
        </a>
        <button type="button" className="pitch-close" aria-label="Tutup info demo" onClick={() => setOpen(false)}>
          <X size={16} aria-hidden />
        </button>
      </div>
    </aside>
  );
}

function MenuSection({ cafe, active, onChange }: { cafe: Cafe; active: number; onChange: (i: number) => void }) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // WAI-ARIA tabs: arrows move between categories, Home/End jump to the ends.
  const onKeyDown = (e: KeyboardEvent) => {
    const last = cafe.menu.length - 1;
    const next = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const i = (next + last + 1) % (last + 1);
    onChange(i);
    tabs.current[i]?.focus();
  };

  return (
    <section id="menu" className="menu wrap" aria-labelledby="menu-title">
      <h2 id="menu-title" className="display">
        Menu
      </h2>
      <div className="tabs" role="tablist" aria-label="Kategori menu" onKeyDown={onKeyDown}>
        {cafe.menu.map((m, i) => (
          <button
            key={m.category}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${i}`}
            aria-selected={i === active}
            aria-controls="menu-panel"
            tabIndex={i === active ? 0 : -1}
            className="tab"
            onClick={() => onChange(i)}
          >
            {m.category}
          </button>
        ))}
      </div>
      <ul id="menu-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="menu-list">
        {cafe.menu[active].items.map((item) => (
          <li key={item.name} className="menu-item">
            <span className="menu-name">
              {item.name}
              {item.note && <small>{item.note}</small>}
            </span>
            <span className="price">{formatPrice(item.price)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
