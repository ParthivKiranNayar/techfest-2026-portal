const photos = [
  { src: '/gallery/hackathon.svg', caption: 'CodeSprint 2025 finalists' },
  { src: '/gallery/robowars.svg', caption: 'RoboWars arena' },
  { src: '/gallery/workshop.svg', caption: 'Cloud workshop' },
  { src: '/gallery/ctf.svg', caption: 'Capture the Flag night' },
  { src: '/gallery/gaming.svg', caption: 'Gaming arena' },
  { src: '/gallery/band.svg', caption: 'Battle of Bands' },
];

export default function Gallery() {
  return (
    <section>
      <h1>Gallery</h1>
      <p className="muted">Moments from TechFest 2025.</p>
      <div className="gallery">
        {photos.map((p) => (
          <figure key={p.src}>
            <img src={p.src} />
            <figcaption>{p.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
