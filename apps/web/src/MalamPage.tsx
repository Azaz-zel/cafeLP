import { ArrowUpRight, InstagramLogo, MapPin, WhatsappLogo } from '@phosphor-icons/react';
import { type CSSProperties, useState } from 'react';
import type { PageData } from '../../api/src/cafes/cafe.schema';
import { PitchBar, useInView, useMenuTabs, useNow } from './CafePage';
import { formatPrice, textOn, waLink } from './format';
import { DAY_KEYS, DAY_LABELS, WEEK_ORDER, formatTime, jakartaClock, openStatus, statusText } from './hours';
import './malam.css';

const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' };

/** Layout "malam": graphite monochrome, tracked geometric capitals, one centred wordmark, raised panels. */
export function MalamPage({ data }: { data: PageData }) {
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
  // The first word is the wordmark; the rest of the name sits under it as a caption.
  const [first, ...rest] = cafe.name.split(/\s+/);
  const half = Math.floor(first.length / 2);
  const [sideA, sideB] = cafe.photos.gallery;
  const style = {
    '--word-len': first.length,
    ...(cafe.accent && { '--accent': cafe.accent, '--on-accent': textOn(cafe.accent) }),
  } as CSSProperties;

  return (
    <div className="malam" style={style}>
      {pitch && <PitchBar cafeName={cafe.name} pitch={pitch} />}

      <section className="ml-hero" aria-labelledby="cafe-name">
        <img className="ml-hero-bg" src={photo(cafe.photos.hero)} alt="" width={900} height={1200} fetchPriority="high" />
        <header className="ml-top">
          <a className="ml-logo" href="#" aria-label={`${cafe.name}, ke atas`}>
            {first.slice(0, half)}
            <br />
            {first.slice(half)}
          </a>
          <nav aria-label="Bagian halaman" className="ml-nav">
            <a href="#menu">Menu</a>
            <a href="#suasana">Suasana</a>
            <a href="#lokasi">Lokasi</a>
            {cafe.memberUrl && (
              <a className="ml-nav-member" href={cafe.memberUrl} {...NEW_TAB}>
                Member
              </a>
            )}
          </nav>
        </header>

        <div className="ml-hero-mid">
          <div className="ml-lockup">
            {cafe.since && <p className="ml-label">Sejak {cafe.since}</p>}
            <h1 id="cafe-name" className="ml-wordmark">
              {first}
              {rest.length > 0 && <span className="sr-only"> {rest.join(' ')}</span>}
            </h1>
            <p className="ml-label ml-lockup-end">
              {rest.length > 0 && (
                <span aria-hidden>
                  {rest.join(' ')}
                  <br />
                </span>
              )}
              {cafe.specialty}
            </p>
          </div>
          <div className="ml-actions" ref={heroActions}>
            <a className="ml-btn ml-btn-solid" href={orderLink} {...NEW_TAB}>
              Pesan via WhatsApp
            </a>
            <a className="ml-btn" href="#menu">
              Lihat menu
            </a>
            {/* Phones have no room for it in the top row, so there it is a hero button instead. */}
            {cafe.memberUrl && (
              <a className="ml-btn ml-actions-member" href={cafe.memberUrl} {...NEW_TAB}>
                Member
              </a>
            )}
          </div>
        </div>

        <div className="ml-hero-foot">
          <div className="ml-social">
            {instagram && (
              <a href={instagram} {...NEW_TAB} aria-label={`Instagram ${cafe.name}`}>
                <InstagramLogo size={18} weight="light" aria-hidden />
              </a>
            )}
            <a href={orderLink} {...NEW_TAB} aria-label={`WhatsApp ${cafe.name}`}>
              <WhatsappLogo size={18} weight="light" aria-hidden />
            </a>
            <a href={cafe.mapsUrl} {...NEW_TAB} aria-label={`${cafe.name} di Google Maps`}>
              <MapPin size={18} weight="light" aria-hidden />
            </a>
          </div>
          <p className="ml-status">
            <span className={`dot ${status.open ? 'dot-open' : ''}`} aria-hidden />
            <span>
              {status.open ? `Buka s/d ${formatTime(status.until)}` : statusText(status).detail}
              <span className="ml-status-area"> · {cafe.area}</span>
            </span>
          </p>
          <span className="ml-scroll" aria-hidden>
            Gulir
          </span>
        </div>
      </section>

      <main>
        <section id="suasana" className="ml-section" aria-labelledby="suasana-title">
          <span className="ml-num" aria-hidden>
            .02
          </span>
          <div className="ml-trio">
            {sideA && (
              <img className="ml-trio-side" src={photo(sideA)} alt={`Sudut ${cafe.name}, foto 1`} width={800} height={800} loading="lazy" />
            )}
            <img
              className="ml-trio-main"
              src={photo(cafe.photos.atmosphere)}
              alt={`Suasana di dalam ${cafe.name}`}
              width={1200}
              height={1500}
              loading="lazy"
            />
            {sideB && (
              <img className="ml-trio-side" src={photo(sideB)} alt={`Sudut ${cafe.name}, foto 2`} width={800} height={800} loading="lazy" />
            )}
          </div>
          <h2 id="suasana-title" className="ml-title">
            {cafe.atmosphere.title}
          </h2>
          <p className="ml-lead">{cafe.atmosphere.text}</p>
          {cafe.facilities.length > 0 && (
            <ul className="ml-facts">
              {cafe.facilities.map((f) => (
                <li key={f.title}>
                  <strong>{f.title}</strong>
                  {f.note}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ml-section ml-section-alt" aria-labelledby="best-title">
          <span className="ml-num" aria-hidden>
            .03
          </span>
          <h2 id="best-title" className="ml-heading">
            Paling dicari
          </h2>
          <ul className="ml-products">
            {cafe.bestSellers.map((b) => (
              <li key={b.name} className="ml-card">
                <img src={photo(b.photo)} alt={b.name} width={800} height={800} loading="lazy" />
                <div className="ml-card-body">
                  <h3>{b.name}</h3>
                  <p className="price">{formatPrice(b.price)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="menu" className="ml-section" aria-labelledby="menu-title">
          <span className="ml-num" aria-hidden>
            .04
          </span>
          <div className="ml-split">
            <div className="ml-split-side">
              <h2 id="menu-title" className="ml-heading">
                Menu
              </h2>
              <div className="ml-tabs" role="tablist" aria-label="Kategori menu" onKeyDown={onKeyDown}>
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
                    className="ml-tab"
                    onClick={() => setCategory(i)}
                  >
                    {m.category}
                  </button>
                ))}
              </div>
            </div>
            <div className="ml-card ml-panel">
              <h3 className="ml-panel-title">{cafe.menu[category].category}</h3>
              <ul id="menu-panel" role="tabpanel" aria-labelledby={`tab-${category}`} className="ml-list">
                {cafe.menu[category].items.map((item) => (
                  <li key={item.name}>
                    <span className="ml-item-name">
                      {item.name}
                      {item.note && <small>{item.note}</small>}
                    </span>
                    <span className="price">{formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="lokasi" className="ml-section ml-section-alt" aria-labelledby="lokasi-title">
          <span className="ml-num" aria-hidden>
            .05
          </span>
          <div className="ml-split">
            <div className="ml-split-side">
              <h2 id="lokasi-title" className="ml-heading">
                Lokasi
              </h2>
              <img
                className="ml-loc-photo"
                src={photo(cafe.photos.location)}
                alt={`Tampak ${cafe.name}`}
                width={1200}
                height={900}
                loading="lazy"
              />
              <p className="ml-label ml-label-strong">Alamat</p>
              <address>{cafe.address}</address>
            </div>
            <div className="ml-card ml-panel">
              <h3 className="ml-panel-title">Jam buka</h3>
              <table className="ml-hours">
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
              <a className="ml-btn ml-btn-inset" href={cafe.mapsUrl} {...NEW_TAB}>
                Buka di Google Maps
                <ArrowUpRight size={14} aria-hidden />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="ml-footer">
        <p className="ml-label">
          {cafe.area} · {cafe.city}
        </p>
        <p className="ml-heading">{cafe.name}</p>
        <ul className="ml-footer-links">
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
        <p className="ml-credit">
          © {now.getFullYear()} {cafe.name}
          {pitch && ` · Contoh website oleh ${pitch.name}`}
        </p>
      </footer>

      <div className="order-bar" data-hidden={heroActionsVisible}>
        <a className="ml-btn ml-btn-solid" href={orderLink} {...NEW_TAB} tabIndex={heroActionsVisible ? -1 : undefined}>
          Pesan via WhatsApp
        </a>
      </div>
    </div>
  );
}
