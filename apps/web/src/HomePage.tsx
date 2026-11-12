import { ArrowRight } from '@phosphor-icons/react';
import type { HomeData } from '../../api/src/cafes/cafe.schema';
import { waLink } from './format';

/** The showcase home (`/`): prospects pick a public demo to open. */
export function HomePage({ data }: { data: HomeData }) {
  const { cafes, pitch } = data;
  const wa = pitch && waLink(pitch.whatsapp, 'Halo, saya mau tanya soal website cafe.');

  return (
    <>
      <header className="wrap home-top">
        {pitch && <span className="home-label">{pitch.name}</span>}
        {wa && (
          <a className="text-link" href={wa}>
            WhatsApp
          </a>
        )}
      </header>

      <main>
        <section className="wrap home-intro">
          <h1 className="home-title">
            Contoh website
            <br />
            cafe.
          </h1>
        </section>

        <section className="wrap home-list-wrap" aria-label="Daftar contoh cafe">
          {cafes.length ? (
            // role="list": Safari drops list semantics from an unstyled <ul>.
            <ul className="home-list" role="list">
              {cafes.map((c, i) => (
                <li key={c.slug}>
                  <a className="home-row" href={`/${c.slug}`}>
                    <span className="home-num" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="home-photo">
                      <img
                        src={`/media/${c.slug}/${c.hero}`}
                        alt=""
                        width={168}
                        height={224}
                        loading={i > 2 ? 'lazy' : undefined}
                      />
                    </span>
                    <span className="home-text">
                      <span className="home-name">{c.name}</span>
                      <span className="home-meta">
                        {c.area}, {c.city} ·{' '}
                        <span className="nowrap">Tema {c.mode === 'dark' ? 'gelap' : 'terang'}</span>
                      </span>
                    </span>
                    <ArrowRight className="home-go" size={28} weight="light" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="home-empty">
              <p className="home-empty-title">Contoh sedang disiapkan.</p>
              {wa && (
                <a className="btn btn-solid" href={wa}>
                  Chat lewat WhatsApp
                </a>
              )}
            </div>
          )}
        </section>

        {wa && cafes.length > 0 && (
          <section className="band">
            <div className="wrap home-cta">
              <h2 className="home-cta-title">Mau website seperti ini?</h2>
              <a className="btn home-cta-btn" href={wa}>
                Chat lewat WhatsApp
              </a>
            </div>
          </section>
        )}
      </main>

      {pitch && (
        <footer className="wrap home-foot">
          © {new Date().getFullYear()} {pitch.name}
        </footer>
      )}
    </>
  );
}
