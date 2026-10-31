const photos = [
  { src: '/gallery/hackathon.svg', caption: 'CodeSprint 2025 finalists', alt: 'Teams coding at the CodeSprint hackathon' },
  { src: '/gallery/robowars.svg', caption: 'RoboWars arena', alt: 'Combat robots facing off in the RoboWars arena' },
  { src: '/gallery/workshop.svg', caption: 'Cloud workshop', alt: 'Students at the cloud deployment workshop' },
  { src: '/gallery/ctf.svg', caption: 'Capture the Flag night', alt: 'Players solving Capture the Flag challenges' },
  { src: '/gallery/gaming.svg', caption: 'Gaming arena', alt: 'Gamers competing on the big screen' },
  { src: '/gallery/band.svg', caption: 'Battle of Bands', alt: 'A college band performing on stage' },
];

// The first row is visible straight away, so it loads eagerly; the rest wait until scrolled near
const EAGER_COUNT = 2;

export default function Gallery() {
  return (
    <section>
      <h1>Gallery</h1>
      <p className="muted">Moments from TechFest 2025.</p>
      <div className="gallery">
        {photos.map((p, i) => (
          <figure key={p.src}>
            <img
              src={p.src}
              alt={p.alt}
              width="800"
              height="600"
              loading={i < EAGER_COUNT ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              decoding="async"
            />
            <figcaption>{p.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
