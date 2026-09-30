import { useEffect, useMemo, useState } from "react";
import logoImg from "@/imports/Logo_web-1.jfif";

type View =
  | { name: "home" }
  | { name: "creator"; creator: string }
  | { name: "project"; creator: string; project: string }
  | { name: "products" }
  | { name: "community" }
  | { name: "topic"; topic: CommunityTopic }
  | { name: "profile" };

type CommunityTopic = {
  title: string;
  author: string;
  category: string;
  replies: number;
};

type Video = {
  title: string;
  creator: string;
  image: string;
  duration: string;
  type: string;
  genre: string;
  year: string;
  format: string;
};

const images = {
  mountain:
    "https://images.unsplash.com/photo-1613390382265-5a0547806df3?auto=format&fit=crop&w=1600&q=85",
  portrait:
    "https://images.unsplash.com/photo-1688407368246-df0f8608f99b?auto=format&fit=crop&w=1400&q=85",
  island:
    "https://images.unsplash.com/photo-1772026676494-178273ebe34e?auto=format&fit=crop&w=1400&q=85",
  city: "https://images.unsplash.com/photo-1696734337635-c0f1f08a7cc7?auto=format&fit=crop&w=1400&q=85",
  train:
    "https://images.unsplash.com/photo-1726413980098-d5148ea519a9?auto=format&fit=crop&w=1400&q=85",
  cage: "https://images.unsplash.com/photo-1633430552351-51caf0fb16a8?auto=format&fit=crop&w=1400&q=85",
  fluid:
    "https://images.unsplash.com/photo-1757428139428-2579e2317dd5?auto=format&fit=crop&w=1400&q=85",
  flowers:
    "https://images.unsplash.com/photo-1681106447892-fde093d56df8?auto=format&fit=crop&w=1400&q=85",
};

const videos: Video[] = [
  {
    title: "Los gigantes del hielo",
    creator: "Luna Norte Studio",
    image: images.mountain,
    duration: "12:48",
    type: "3D",
    genre: "Fantasía",
    year: "2025",
    format: "Cortometraje",
  },
  {
    title: "Órbita interior",
    creator: "Martín Ochoa",
    image: images.portrait,
    duration: "08:20",
    type: "IA",
    genre: "Drama",
    year: "2025",
    format: "Musical",
  },
  {
    title: "Archipiélago violeta",
    creator: "Luna Norte Studio",
    image: images.island,
    duration: "22:14",
    type: "2D",
    genre: "Fantasía",
    year: "2024",
    format: "Serie",
  },
  {
    title: "Neón, capítulo cero",
    creator: "Marea Films",
    image: images.city,
    duration: "04:56",
    type: "IA",
    genre: "Acción",
    year: "2025",
    format: "Tráiler",
  },
  {
    title: "Último tren a casa",
    creator: "Taller Bruma",
    image: images.train,
    duration: "16:03",
    type: "Stop motion",
    genre: "Drama",
    year: "2023",
    format: "Cortometraje",
  },
  {
    title: "La fiesta imposible",
    creator: "Taller Bruma",
    image: images.cage,
    duration: "09:41",
    type: "Stop motion",
    genre: "Comedia",
    year: "2024",
    format: "Publicidad",
  },
  {
    title: "Materia sensible",
    creator: "Marea Films",
    image: images.fluid,
    duration: "06:18",
    type: "3D",
    genre: "Experimental",
    year: "2025",
    format: "Musical",
  },
  {
    title: "Pintar un mundo",
    creator: "Martín Ochoa",
    image: images.flowers,
    duration: "18:32",
    type: "2D",
    genre: "Tutorial",
    year: "2023",
    format: "Tutorial",
  },
];

const moreTitles = [
  "Bajo dos lunas",
  "El jardín mecánico",
  "Frecuencia fantasma",
  "Manual para desaparecer",
  "Náufragos del tiempo",
  "Bestias de papel",
  "La memoria del agua",
  "Círculo de ceniza",
  "Pájaros de neón",
  "La última semilla",
  "Ruido blanco",
  "Atlas de sueños",
  "Una casa en Marte",
  "Los días transparentes",
  "Bosque de hierro",
  "Retrato de una estrella",
];
const moreImages = [images.island, images.cage, images.city, images.flowers, images.mountain, images.portrait, images.fluid, images.train];
const moreCreators = ["Faro Animación", "Estudio Nube", "Marea Films", "Taller Bruma"];
const moreGenres = ["Sci-fi", "Grimdark", "Drama", "Fantasía", "Terror", "Experimental"];
videos.push(
  ...moreTitles.map((title, index): Video => ({
    title,
    creator: moreCreators[index % moreCreators.length],
    image: moreImages[index % moreImages.length],
    duration: `${String(6 + (index % 18)).padStart(2, "0")}:${String(12 + index * 3).slice(-2)}`,
    type: ["2D", "3D", "Stop motion", "IA"][index % 4],
    genre: moreGenres[index % moreGenres.length],
    year: String(2025 - (index % 5)),
    format: ["Cortometraje", "Serie", "Musical", "Tráiler"][index % 4],
  })),
);

const featured = videos.slice(0, 5);

function Icon({
  name,
  size = 20,
}: {
  name: "play" | "search" | "arrow" | "chevron" | "grid" | "spark" | "heart" | "chat" | "bookmark" | "user";
  size?: number;
}) {
  const paths = {
    play: <path d="m9 7 8 5-8 5V7Z" fill="currentColor" />,
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    arrow: <path d="m15 18-6-6 6-6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    spark: <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z" />,
    heart: <path d="M20.8 5.8c-1.7-1.8-4.6-1.8-6.4 0L12 8.2 9.6 5.8a4.5 4.5 0 0 0-6.4 6.4L12 21l8.8-8.8a4.5 4.5 0 0 0 0-6.4Z" />,
    chat: <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v8Z" />,
    bookmark: <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}

function Button({
  children,
  className = "",
  onClick,
  label,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  label?: string;
  type?: "button" | "submit";
}) {
  return (
    <button aria-label={label} className={className} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="filter">
      <span>{label}</span>
      <span className="select-shell">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Todos</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <Icon name="chevron" size={16} />
      </span>
    </label>
  );
}

function Header({
  navigate,
  onRegister,
  loggedIn,
  onLogout,
}: {
  navigate: (view: View) => void;
  onRegister: () => void;
  loggedIn: boolean;
  onLogout: () => void;
}) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const suggestions = query.trim()
    ? videos.filter(
        (video) =>
          video.title.toLowerCase().includes(query.toLowerCase()) ||
          video.creator.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 5)
    : [];
  return (
    <header className="topbar">
      <Button className="brand" onClick={() => navigate({ name: "home" })} label="Ir al inicio">
        <img src={logoImg} alt="ANIMA" style={{ width: "fit-content", height: "fit-content", maxHeight: "44px", maxWidth: "160px", objectFit: "contain", display: "block" }} />
      </Button>
      <div className="global-search">
        <Icon name="search" size={18} />
        <input
          aria-label="Buscar videos o creadores"
          placeholder="Buscar videos o creadores"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <div className="search-results">
            {suggestions.map((video) => (
              <Button
                className="search-result"
                key={video.title}
                onClick={() => {
                  navigate({ name: "creator", creator: video.creator });
                  setQuery("");
                }}
              >
                <img src={video.image} alt="" />
                <span><strong>{video.title}</strong><small>{video.creator}</small></span>
              </Button>
            ))}
            {!suggestions.length && <p>Sin resultados</p>}
          </div>
        )}
      </div>
      <nav aria-label="Navegación principal">
        <Button className="nav-link" onClick={() => navigate({ name: "home" })}>Explorar</Button>
        <Button className="nav-link" onClick={() => navigate({ name: "products" })}>Productos</Button>
        <Button className="nav-link" onClick={() => navigate({ name: "community" })}>Comunidad</Button>
        {loggedIn ? (
          <div className="user-menu">
            <Button className="user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
              <span>AR</span><Icon name="chevron" size={15} />
            </Button>
            {menuOpen && (
              <div className="user-dropdown">
                <div><strong>Alex Rivera</strong><small>alex@gmail.com</small></div>
                <Button onClick={() => { navigate({ name: "profile" }); setMenuOpen(false); }}><Icon name="user" size={17} /> Mi perfil</Button>
                <Button onClick={() => { navigate({ name: "profile" }); setMenuOpen(false); }}><Icon name="grid" size={17} /> Crear proyecto</Button>
                <Button onClick={() => { onLogout(); setMenuOpen(false); }}>Cerrar sesión</Button>
              </div>
            )}
          </div>
        ) : (
          <Button className="register-button" onClick={onRegister}>Registrarse</Button>
        )}
      </nav>
    </header>
  );
}

function VideoCard({ video, onOpen }: { video: Video; onOpen: () => void }) {
  return (
    <article className="video-card">
      <Button className="thumbnail" onClick={onOpen} label={`Ver creador de ${video.title}`}>
        <img src={video.image} alt="" />
        <span className="play"><Icon name="play" size={22} /></span>
        <span className="duration">{video.duration}</span>
      </Button>
      <div className="video-meta">
        <Button className="video-title" onClick={onOpen}>{video.title}</Button>
        <p>{video.creator}</p>
        <div className="tag-row"><span>{video.type}</span><span>{video.format}</span></div>
      </div>
    </article>
  );
}

function Home({ navigate }: { navigate: (view: View) => void }) {
  const [slide, setSlide] = useState(0);
  const [filters, setFilters] = useState({ type: "", genre: "", year: "", format: "" });
  const [visibleCount, setVisibleCount] = useState(8);
  const current = featured[slide];
  useEffect(() => {
    const timer = window.setInterval(
      () => setSlide((currentSlide) => (currentSlide + 1) % featured.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, index) =>
    String(currentYear - index),
  );
  const genres = [
    "Acción",
    "Aventura",
    "Ciencia ficción",
    "Sci-fi",
    "Fantasía",
    "Grimdark",
    "Drama",
    "Comedia",
    "Terror",
    "Suspense",
    "Romance",
    "Documental",
    "Experimental",
    "Infantil",
    "Tutorial",
  ];
  const filtered = useMemo(
    () =>
      videos.filter(
        (video) =>
          (!filters.type || video.type === filters.type) &&
          (!filters.genre || video.genre === filters.genre) &&
          (!filters.year || video.year === filters.year) &&
          (!filters.format || video.format === filters.format),
      ),
    [filters],
  );

  const update = (key: keyof typeof filters) => (value: string) =>
    setFilters((previous) => {
      setVisibleCount(8);
      return { ...previous, [key]: value };
    });

  return (
    <main>
      <section className="hero" aria-label="Contenido destacado">
        {featured.map((video, index) => (
          <img
            key={video.title}
            className={index === slide ? "hero-image visible" : "hero-image"}
            src={video.image}
            alt=""
          />
        ))}
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">Selección de la semana</p>
          <h1>{current.title}</h1>
          <p className="hero-copy">
            Una historia sobre paisajes imposibles, memoria y la belleza de volver a empezar.
          </p>
          <div className="hero-actions">
            <Button
              className="primary-button"
              onClick={() => navigate({ name: "creator", creator: current.creator })}
            >
              <Icon name="play" /> Ver proyecto
            </Button>
            <span>Por {current.creator}</span>
          </div>
        </div>
        <div className="carousel-controls">
          <span>{String(slide + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}</span>
          <div>
            <Button
              className="circle-button previous"
              onClick={() => setSlide((slide - 1 + featured.length) % featured.length)}
              label="Anterior"
            ><Icon name="arrow" /></Button>
            <Button
              className="circle-button"
              onClick={() => setSlide((slide + 1) % featured.length)}
              label="Siguiente"
            ><Icon name="arrow" /></Button>
          </div>
        </div>
      </section>

      <section className="explore-section">
        <div className="section-heading">
          <div><p className="eyebrow dark">Recién publicados</p><h2>Lo más reciente</h2></div>
          <p>Estrenos de la comunidad seleccionados por fecha de publicación.</p>
        </div>
        <div className="recent-grid">
          {videos.slice(0, 4).map((video, index) => (
            <Button
              className="recent-item"
              key={video.title}
              onClick={() => navigate({ name: "creator", creator: video.creator })}
            >
              <span className="recent-rank">0{index + 1}</span>
              <span className="recent-image"><img src={video.image} alt="" /></span>
              <span className="recent-copy"><strong>{video.title}</strong><small>{video.creator} · {video.year}</small></span>
            </Button>
          ))}
        </div>
        <div className="filters">
          <Select label="Animación" value={filters.type} options={["Stop motion", "2D", "3D", "IA"]} onChange={update("type")} />
          <Select label="Género" value={filters.genre} options={genres} onChange={update("genre")} />
          <Select label="Año" value={filters.year} options={years} onChange={update("year")} />
          <Select label="Proyecto" value={filters.format} options={["Cortometraje", "Largometraje", "Serie", "Tráiler", "Publicidad", "Musical", "Tutorial"]} onChange={update("format")} />
        </div>
        <div className="results-bar">
          <span><Icon name="grid" size={17} /> {filtered.length} proyectos</span>
          {Object.values(filters).some(Boolean) && (
            <Button className="clear-button" onClick={() => { setFilters({ type: "", genre: "", year: "", format: "" }); setVisibleCount(8); }}>Limpiar filtros</Button>
          )}
        </div>
        <div className="video-grid">
          {filtered.slice(0, visibleCount).map((video) => (
            <VideoCard
              key={video.title}
              video={video}
              onOpen={() => navigate({ name: "creator", creator: video.creator })}
            />
          ))}
        </div>
        {visibleCount < filtered.length && (
          <div className="load-more">
            <Button className="dark-button" onClick={() => setVisibleCount((count) => count + 8)}>
              Ver más
            </Button>
            <span>Mostrando {Math.min(visibleCount, filtered.length)} de {filtered.length}</span>
          </div>
        )}
        {!filtered.length && <div className="empty"><p>No encontramos proyectos con estos filtros.</p><Button className="text-button" onClick={() => { setFilters({ type: "", genre: "", year: "", format: "" }); setVisibleCount(8); }}>Ver todos los proyectos</Button></div>}
      </section>
    </main>
  );
}

function CreatorPage({
  creator,
  navigate,
}: {
  creator: string;
  navigate: (view: View) => void;
}) {
  const projects = videos.filter((video) => video.creator === creator);
  const lead = projects[0] ?? videos[0];
  return (
    <main className="inner-page">
      <Button className="back-button" onClick={() => navigate({ name: "home" })}><Icon name="arrow" /> Volver a explorar</Button>
      <section className="creator-hero">
        <div className="creator-copy">
          <p className="eyebrow dark">Creador destacado</p>
          <h1>{creator}</h1>
          <p>Estudio independiente que explora nuevas formas de narrar a través de la animación, la música y el diseño.</p>
          <div className="creator-stats"><span><strong>{projects.length}</strong> proyectos</span><span><strong>24K</strong> seguidores</span></div>
        </div>
        <div className="creator-portrait"><img src={lead.image} alt={`Trabajo de ${creator}`} /></div>
      </section>
      <section className="project-list">
        <div className="section-heading"><div><p className="eyebrow dark">Filmografía</p><h2>Proyectos</h2></div></div>
        <div className="video-grid">
          {projects.map((video) => (
            <VideoCard
              key={video.title}
              video={video}
              onOpen={() => navigate({ name: "project", creator, project: video.title })}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProjectPage({
  creator,
  project,
  navigate,
  favorite,
  onToggleFavorite,
}: {
  creator: string;
  project: string;
  navigate: (view: View) => void;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  const selected = videos.find((video) => video.title === project) ?? videos[0];
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(128);
  const [copied, setCopied] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    { author: "Nora C.", text: "El diseño de sonido y la atmósfera son increíbles." },
    { author: "Diego M.", text: "Una dirección de arte preciosa. Esperando el siguiente episodio." },
  ]);
  const episodes = [
    { number: "01", title: "El umbral", duration: "18 min" },
    { number: "02", title: "El eco de las montañas", duration: "22 min" },
    { number: "03", title: "Una luz en el hielo", duration: "19 min" },
    { number: "04", title: "Donde empieza el norte", duration: "24 min" },
  ];
  return (
    <main className="project-page">
      <section className="project-banner">
        <img src={selected.image} alt="" />
        <div className="hero-shade" />
        <Button className="back-on-dark" onClick={() => navigate({ name: "creator", creator })}><Icon name="arrow" /> {creator}</Button>
        <div className="banner-copy">
          <p className="eyebrow">Serie original · {selected.year}</p>
          <h1>{project}</h1>
          <p>En los confines del mundo, un pequeño grupo descubre que cada recuerdo deja una huella.</p>
          <div className="banner-actions">
            <Button className="primary-button"><Icon name="play" /> Ver primer episodio</Button>
            <Button
              className={liked ? "support-button liked" : "support-button"}
              onClick={() => {
                setLiked(!liked);
                setLikes((value) => value + (liked ? -1 : 1));
              }}
            ><Icon name="heart" /> {likes} Me gusta</Button>
            <Button
              className={favorite ? "support-button liked" : "support-button"}
              onClick={onToggleFavorite}
            ><Icon name="bookmark" /> {favorite ? "Guardado" : "Favorito"}</Button>
            <Button
              className="support-button"
              onClick={() => window.open("https://www.patreon.com/", "_blank", "noopener,noreferrer")}
            >Apoyar en Patreon</Button>
            <Button
              className="support-button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1800);
              }}
            >{copied ? "Enlace copiado" : "Compartir"}</Button>
          </div>
        </div>
      </section>
      <section className="episodes">
        <div className="section-heading"><div><p className="eyebrow dark">Temporada 1</p><h2>Episodios</h2></div><p>4 episodios</p></div>
        <div className="episode-list">
          {episodes.map((episode, index) => (
            <Button className="episode" key={episode.number}>
              <span className="episode-number">{episode.number}</span>
              <span className="episode-thumb"><img src={featured[index % featured.length].image} alt="" /><span className="play small"><Icon name="play" size={16} /></span></span>
              <span className="episode-info"><strong>{episode.title}</strong><small>Episodio {episode.number} · {episode.duration}</small></span>
              <span className="episode-action">Reproducir <Icon name="play" size={16} /></span>
            </Button>
          ))}
        </div>
        <section className="comments">
          <div className="comments-heading"><div><Icon name="chat" /><h2>Comentarios</h2></div><span>{comments.length}</span></div>
          <form
            className="comment-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!comment.trim()) return;
              setComments((items) => [{ author: "Tú", text: comment.trim() }, ...items]);
              setComment("");
            }}
          >
            <div className="comment-avatar">T</div>
            <textarea
              aria-label="Escribe un comentario"
              placeholder="Comparte qué te ha parecido..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <Button className="comment-submit" type="submit">Publicar</Button>
          </form>
          <div className="comment-list">
            {comments.map((item, index) => (
              <article className="comment" key={`${item.author}-${index}`}>
                <span className="comment-avatar">{item.author.charAt(0)}</span>
                <div><strong>{item.author}</strong><small>Ahora</small><p>{item.text}</p></div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

const products = [
  { name: "Blender", type: "Software 3D", price: "Gratis", image: images.fluid, description: "Modelado, animación, simulación y render en una sola herramienta." },
  { name: "DaVinci Resolve", type: "Edición de video", price: "Gratis / Pro", image: images.city, description: "Edición, color, efectos visuales y audio profesional." },
  { name: "Tableta Pen Pro", type: "Hardware", price: "Desde 249 €", image: images.flowers, description: "Tableta de dibujo con alta sensibilidad para ilustración y animación 2D." },
  { name: "Kit Stop Motion", type: "Equipamiento", price: "89 €", image: images.cage, description: "Soportes articulados, iluminación y fondos para tu primer set." },
  { name: "Dragonframe", type: "Software stop motion", price: "De pago", image: images.train, description: "Captura profesional y control de cámara para producciones stop motion." },
  { name: "Guante de dibujo", type: "Accesorios", price: "12 €", image: images.portrait, description: "Reduce la fricción y mejora la precisión en tabletas gráficas." },
];

function ProductsPage({ navigate }: { navigate: (view: View) => void }) {
  const [category, setCategory] = useState("");
  const visible = products.filter((product) => !category || product.type.includes(category));
  return (
    <main className="directory-page">
      <section className="directory-hero">
        <Button className="back-button" onClick={() => navigate({ name: "home" })}><Icon name="arrow" /> Volver</Button>
        <p className="eyebrow dark">Recursos seleccionados</p>
        <h1>Herramientas para dar vida a tus ideas.</h1>
        <p>Software, hardware y materiales recomendados por artistas de la comunidad.</p>
      </section>
      <section className="directory-content">
        <div className="category-tabs">
          {["", "Software", "Hardware", "Accesorios", "Equipamiento"].map((item) => (
            <Button className={category === item ? "category-tab active" : "category-tab"} key={item || "Todo"} onClick={() => setCategory(item)}>{item || "Todo"}</Button>
          ))}
        </div>
        <div className="product-grid">
          {visible.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="product-image"><img src={product.image} alt="" /><span>{product.type}</span></div>
              <div className="product-copy"><h2>{product.name}</h2><p>{product.description}</p><div><strong>{product.price}</strong><Button className="text-button">Ver producto</Button></div></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function CommunityPage({ navigate }: { navigate: (view: View) => void }) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState<CommunityTopic[]>([
    { title: "¿Qué software recomendáis para empezar en 2D?", author: "Elena Ruiz", category: "Herramientas", replies: 24 },
    { title: "Comparto mi proceso de iluminación para stop motion", author: "Leo Santos", category: "Proceso", replies: 18 },
    { title: "Busco animador 3D para cortometraje sci-fi", author: "Carla V.", category: "Colaboraciones", replies: 11 },
    { title: "Referencias visuales para mundos grimdark", author: "Dani Mora", category: "Inspiración", replies: 36 },
  ]);
  return (
    <main className="directory-page community-page">
      <section className="directory-hero community-hero">
        <Button className="back-button" onClick={() => navigate({ name: "home" })}><Icon name="arrow" /> Volver</Button>
        <div><p className="eyebrow dark">Foro abierto</p><h1>La comunidad hace avanzar las historias.</h1><p>Pregunta, comparte procesos y encuentra colaboradores.</p></div>
        <Button className="dark-button" onClick={() => setCreating(true)}>Crear un tema</Button>
      </section>
      <section className="topics-section">
        <div className="topics-head"><span>Tema</span><span>Respuestas</span></div>
        {topics.map((topic) => (
          <Button className="topic" key={topic.title} onClick={() => navigate({ name: "topic", topic })}>
            <div className="topic-avatar">{topic.author.charAt(0)}</div>
            <div><span className="topic-category">{topic.category}</span><h2>{topic.title}</h2><p>Creado por <strong>{topic.author}</strong></p></div>
            <span className="reply-count">{topic.replies}<small>comentarios</small></span>
          </Button>
        ))}
      </section>
      {creating && (
        <div className="modal-layer" onMouseDown={() => setCreating(false)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head"><div><p className="eyebrow dark">Comunidad</p><h2>Crear un tema</h2></div><Button className="modal-close" onClick={() => setCreating(false)}>Cerrar</Button></div>
            <label className="field"><span>Título</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="¿Sobre qué quieres hablar?" /></label>
            <label className="field"><span>Mensaje</span><textarea placeholder="Añade contexto para la comunidad..." /></label>
            <Button className="dark-button" onClick={() => {
              if (!title.trim()) return;
              setTopics((items) => [{ title: title.trim(), author: "Tú", category: "General", replies: 0 }, ...items]);
              setTitle("");
              setCreating(false);
            }}>Publicar tema</Button>
          </div>
        </div>
      )}
    </main>
  );
}

function TopicPage({
  topic,
  navigate,
}: {
  topic: CommunityTopic;
  navigate: (view: View) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState([
    { author: "Marina Sol", text: "Gracias por abrir este tema. Comparto totalmente el enfoque." },
    { author: "Joel P.", text: "Dejo una recomendación: empezar con una prueba pequeña antes de producir la escena completa." },
  ]);
  return (
    <main className="article-page">
      <Button className="back-button" onClick={() => navigate({ name: "community" })}><Icon name="arrow" /> Volver a comunidad</Button>
      <article className="community-article">
        <div className="article-author"><span className="topic-avatar">{topic.author.charAt(0)}</span><div><strong>{topic.author}</strong><small>Publicado hoy · 6 min de lectura</small></div></div>
        <span className="topic-category">{topic.category}</span>
        <h1>{topic.title}</h1>
        <p>Hola, comunidad. Quería compartir algunas ideas y abrir una conversación sobre este tema. En mis últimos proyectos he estado probando distintas formas de organizar el proceso creativo sin perder flexibilidad.</p>
        <p>Lo que mejor me ha funcionado es comenzar con una referencia visual clara, dividir el trabajo en pruebas cortas y documentar cada decisión importante. Así, el equipo puede avanzar con una visión compartida y corregir problemas antes de llegar a producción.</p>
        <blockquote>Una buena prueba de animación puede ahorrar días de trabajo y mejorar el resultado final.</blockquote>
        <p>Me gustaría conocer vuestras experiencias, herramientas favoritas y cualquier consejo que pueda servir a otros artistas que estén empezando.</p>
        <div className="article-actions">
          <Button className={liked ? "article-like active" : "article-like"} onClick={() => setLiked(!liked)}><Icon name="heart" /> {liked ? 43 : 42} Me gusta</Button>
          <span><Icon name="chat" /> {comments.length} comentarios</span>
        </div>
      </article>
      <section className="article-comments">
        <h2>Conversación</h2>
        <form onSubmit={(event) => {
          event.preventDefault();
          if (!message.trim()) return;
          setComments((items) => [{ author: "Invitado", text: message.trim() }, ...items]);
          setMessage("");
        }}>
          <textarea aria-label="Escribe un comentario" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Puedes comentar sin iniciar sesión..." />
          <Button className="dark-button" type="submit">Publicar comentario</Button>
        </form>
        {comments.map((comment, index) => (
          <article className="comment" key={`${comment.author}-${index}`}>
            <span className="comment-avatar">{comment.author.charAt(0)}</span>
            <div><strong>{comment.author}</strong><small>Ahora</small><p>{comment.text}</p></div>
          </article>
        ))}
      </section>
    </main>
  );
}

type DraftProject = {
  title: string;
  description: string;
  animation: string;
  genres: string[];
  year: string;
  format: string;
  episodes: string[];
  status?: "Publicado" | "En revisión";
};

function ProjectEditor({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (project: DraftProject) => void;
}) {
  const currentYear = String(new Date().getFullYear());
  const [draft, setDraft] = useState<DraftProject>({
    title: "",
    description: "",
    animation: "2D",
    genres: ["Ciencia ficción"],
    year: currentYear,
    format: "Cortometraje",
    episodes: [],
  });
  const [episode, setEpisode] = useState("");
  const genres = ["Acción", "Aventura", "Ciencia ficción", "Sci-fi", "Fantasía", "Grimdark", "Drama", "Comedia", "Terror", "Suspense", "Romance", "Documental", "Experimental", "Infantil", "Tutorial"];
  const [submitted, setSubmitted] = useState(false);
  const field = (key: "title" | "description" | "animation" | "year" | "format") => (value: string) =>
    setDraft((item) => ({ ...item, [key]: value }));
  const moveEpisode = (index: number, direction: number) => {
    const target = index + direction;
    if (target < 0 || target >= draft.episodes.length) return;
    setDraft((item) => {
      const episodes = [...item.episodes];
      [episodes[index], episodes[target]] = [episodes[target], episodes[index]];
      return { ...item, episodes };
    });
  };
  const toggleGenre = (genre: string) =>
    setDraft((item) => {
      if (item.genres.includes(genre)) {
        return { ...item, genres: item.genres.filter((value) => value !== genre) };
      }
      if (item.genres.length >= 3) return item;
      return { ...item, genres: [...item.genres, genre] };
    });
  if (submitted) {
    return (
      <div className="modal-layer">
        <div className="modal review-notice">
          <span className="brand-mark"><Icon name="spark" /></span>
          <p className="eyebrow dark">Proyecto recibido</p>
          <h2>Proceso de Revisión y Directrices para Publicar Proyectos</h2>
          <p>Queremos mantener una plataforma de alta calidad centrada en el talento y la animación independiente. Por esta razón, todos los proyectos enviados entrarán en una fase de revisión antes de ser publicados oficialmente en la web.</p>
          <p>Para asegurar que la comunidad mantenga un estándar excelente y evitar la saturación de contenido aleatorio, tu proyecto debe cumplir con los siguientes requisitos mínimos:</p>
          <ul>
            <li><strong>Obras terminadas:</strong> Los cortometrajes, películas y piezas únicas deben estar completamente finalizados.</li>
            <li><strong>Estándar de calidad:</strong> No importa el estilo, la técnica de animación o el género (comedia, drama, ciencia ficción, etc.); lo importante es que el proyecto cuente con una calidad de producción cuidada y digna de ser exhibida.</li>
            <li><strong>Series en emisión:</strong> Si estás subiendo una serie, no necesitas esperar a terminarla por completo: puedes ir publicando y añadiendo los episodios a medida que vayan estando listos y finalizados.</li>
          </ul>
          <p>¡Gracias por compartir tu arte y formar parte de nuestra comunidad de animación!</p>
          <Button className="dark-button" onClick={onClose}>Entendido</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="modal-layer">
      <div className="modal project-editor">
        <div className="modal-head"><div><p className="eyebrow dark">Nuevo proyecto</p><h2>Publica tu trabajo</h2></div><Button className="modal-close" onClick={onClose}>Cerrar</Button></div>
        <div className="editor-grid">
          <label className="field wide"><span>Título</span><input value={draft.title} onChange={(event) => field("title")(event.target.value)} placeholder="Título del proyecto" /></label>
          <label className="field wide"><span>Descripción</span><textarea value={draft.description} onChange={(event) => field("description")(event.target.value)} placeholder="Cuenta de qué trata..." /></label>
          <Select label="Animación" value={draft.animation} options={["Stop motion", "2D", "3D", "IA"]} onChange={field("animation")} />
          <div className="genre-picker wide">
            <div><strong>Géneros</strong><span>{draft.genres.length}/3 seleccionados</span></div>
            <div>{genres.map((genre) => (
              <Button
                className={draft.genres.includes(genre) ? "genre-option selected" : "genre-option"}
                key={genre}
                onClick={() => toggleGenre(genre)}
              >{genre}</Button>
            ))}</div>
          </div>
          <Select label="Año" value={draft.year} options={Array.from({ length: Number(currentYear) - 1999 }, (_, index) => String(Number(currentYear) - index))} onChange={field("year")} />
          <Select label="Proyecto" value={draft.format} options={["Cortometraje", "Largometraje", "Serie", "Tráiler", "Publicidad", "Musical", "Tutorial"]} onChange={field("format")} />
        </div>
        {draft.format === "Serie" && (
          <div className="episode-editor">
            <div><strong>Episodios</strong><small>Añade y organiza el orden de reproducción.</small></div>
            <div className="add-episode"><input value={episode} onChange={(event) => setEpisode(event.target.value)} placeholder="Título del episodio" /><Button onClick={() => {
              if (!episode.trim()) return;
              setDraft((item) => ({ ...item, episodes: [...item.episodes, episode.trim()] }));
              setEpisode("");
            }}>Añadir</Button></div>
            {draft.episodes.map((item, index) => (
              <div className="editable-episode" key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong><Button onClick={() => moveEpisode(index, -1)}>Subir</Button><Button onClick={() => moveEpisode(index, 1)}>Bajar</Button><Button onClick={() => setDraft((project) => ({ ...project, episodes: project.episodes.filter((_, itemIndex) => itemIndex !== index) }))}>Eliminar</Button></div>
            ))}
          </div>
        )}
        <div className="editor-actions"><Button className="modal-close" onClick={onClose}>Guardar borrador</Button><Button className="dark-button" onClick={() => {
          if (!draft.title.trim()) return;
          onSave(draft);
          setSubmitted(true);
        }}>Publicar proyecto</Button></div>
      </div>
    </div>
  );
}

function ProfilePage({
  navigate,
  favorites,
}: {
  navigate: (view: View) => void;
  favorites: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projects, setProjects] = useState<DraftProject[]>([
    { title: "Ciudad de cristal", description: "Una prueba de iluminación y entornos.", animation: "3D", genres: ["Sci-fi", "Drama"], year: "2025", format: "Serie", episodes: ["La señal", "La torre"], status: "Publicado" },
    { title: "Tinta viva", description: "Cortometraje experimental dibujado a mano.", animation: "2D", genres: ["Experimental"], year: "2024", format: "Cortometraje", episodes: [], status: "Publicado" },
  ]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const favoriteVideos = videos.filter((video) => favorites.includes(video.title));
  const moveProject = (index: number, direction: number) => {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    setProjects((items) => {
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  return (
    <main className="profile-page">
      <section className="profile-cover">
        <div className="profile-avatar">AR</div>
        <div><p className="eyebrow">Perfil de creador</p><h1>Alex Rivera</h1><p>Animador 2D y explorador de mundos imposibles.</p></div>
        <Button className="support-button" onClick={() => setEditing(!editing)}>Personalizar perfil</Button>
      </section>
      {editing && (
        <section className="profile-settings">
          <label className="field"><span>Nombre público</span><input defaultValue="Alex Rivera" /></label>
          <label className="field"><span>Biografía</span><textarea defaultValue="Animador 2D y explorador de mundos imposibles." /></label>
          <Button className="dark-button" onClick={() => setEditing(false)}>Guardar cambios</Button>
        </section>
      )}
      <section className="creator-analytics">
        <div className="analytics-inner">
          <p className="eyebrow dark">Resumen de actividad</p>
          <div className="analytics-grid">
            <div className="analytic-card"><span className="analytic-value">14 820</span><span className="analytic-label"><Icon name="eye" size={15} /> Vistas totales</span></div>
            <div className="analytic-card"><span className="analytic-value">2 340</span><span className="analytic-label"><Icon name="heart" size={15} /> Likes recibidos</span></div>
            <div className="analytic-card"><span className="analytic-value">487</span><span className="analytic-label"><Icon name="chat" size={15} /> Comentarios</span></div>
            <div className="analytic-card"><span className="analytic-value">1 093</span><span className="analytic-label"><Icon name="bookmark" size={15} /> Favoritos</span></div>
          </div>
        </div>
      </section>
      <section className="profile-content">
        <div className="profile-section-head"><div><p className="eyebrow dark">Portfolio</p><h2>Mis proyectos</h2></div><Button className="dark-button" onClick={() => setCreating(true)}>Crear proyecto</Button></div>
        <div className="owned-projects">
          {projects.map((project, index) => (
            <article className="owned-project" key={`${project.title}-${index}`}>
              <span className="project-order">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <span className="topic-category">{project.animation} · {project.format} · {project.genres.join(", ")}</span>
                <span className={project.status === "En revisión" ? "project-status review" : "project-status"}>{project.status ?? "Publicado"}</span>
                {editingIndex === index ? (
                  <input className="inline-edit" value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} />
                ) : <h3>{project.title}</h3>}
                <p>{project.description}</p>
              </div>
              <div className="order-actions">
                {editingIndex === index ? (
                  <Button onClick={() => {
                    setProjects((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, title: editingTitle || item.title } : item));
                    setEditingIndex(null);
                  }}>Guardar</Button>
                ) : <Button onClick={() => { setEditingIndex(index); setEditingTitle(project.title); }}>Editar</Button>}
                <Button onClick={() => setProjects((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Eliminar</Button>
                <Button onClick={() => moveProject(index, -1)}>Subir</Button>
                <Button onClick={() => moveProject(index, 1)}>Bajar</Button>
              </div>
            </article>
          ))}
        </div>
        <div className="profile-section-head favorites-head"><div><p className="eyebrow dark">Guardados</p><h2>Videos favoritos</h2></div></div>
        {favoriteVideos.length ? (
          <div className="video-grid">{favoriteVideos.map((video) => <VideoCard key={video.title} video={video} onOpen={() => navigate({ name: "project", creator: video.creator, project: video.title })} />)}</div>
        ) : (
          <div className="empty-state"><Icon name="bookmark" /><p>Aún no has guardado ningún video.</p><Button className="text-button" onClick={() => navigate({ name: "home" })}>Explorar proyectos</Button></div>
        )}
      </section>
      {creating && <ProjectEditor onClose={() => setCreating(false)} onSave={(project) => setProjects((items) => [...items, { ...project, status: "En revisión" }])} />}
    </main>
  );
}

function RegisterModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <div className="modal auth-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="brand-mark"><Icon name="spark" size={18} /></div>
        <p className="eyebrow dark">Únete a Anima</p>
        <h2>Tu comunidad creativa, en un solo lugar.</h2>
        <p>Guarda proyectos, comenta y conecta con otros creadores sin gestionar una contraseña nueva.</p>
        <Button className="google-button" onClick={onLogin}><span>G</span> Continuar con Google</Button>
        <small>Al continuar, aceptas los términos y la política de privacidad.</small>
        <Button className="modal-close auth-close" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="app">
      <Header
        navigate={navigate}
        onRegister={() => setRegisterOpen(true)}
        loggedIn={loggedIn}
        onLogout={() => {
          setLoggedIn(false);
          navigate({ name: "home" });
        }}
      />
      {view.name === "home" && <Home navigate={navigate} />}
      {view.name === "creator" && <CreatorPage creator={view.creator} navigate={navigate} />}
      {view.name === "project" && (
        <ProjectPage
          creator={view.creator}
          project={view.project}
          navigate={navigate}
          favorite={favorites.includes(view.project)}
          onToggleFavorite={() =>
            setFavorites((items) =>
              items.includes(view.project)
                ? items.filter((item) => item !== view.project)
                : [...items, view.project],
            )
          }
        />
      )}
      {view.name === "products" && <ProductsPage navigate={navigate} />}
      {view.name === "community" && <CommunityPage navigate={navigate} />}
      {view.name === "topic" && <TopicPage topic={view.topic} navigate={navigate} />}
      {view.name === "profile" && <ProfilePage navigate={navigate} favorites={favorites} />}
      {registerOpen && (
        <RegisterModal
          onClose={() => setRegisterOpen(false)}
          onLogin={() => {
            setLoggedIn(true);
            setRegisterOpen(false);
            navigate({ name: "profile" });
          }}
        />
      )}
      <footer><span>ANIMA</span><p>Historias que cobran vida.</p><small>© 2025 Anima Archivo</small></footer>
    </div>
  );
}
