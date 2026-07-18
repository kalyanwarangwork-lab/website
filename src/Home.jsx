import magazineImage from './assets/magazine-home.png'
import websiteLogo from './assets/website_logo2.png'

function Home() {
  return (
    <main className="magazine-home" aria-label="Ishwari Jadhav Architecture home">
      <section className="magazine-cover">
        <img
          className="cover-image"
          src={magazineImage}
          alt="Sunlit contemporary architecture interior with natural stone, wood, and garden views"
        />

        <a className="logo" href="/" aria-label="Ishwari Jadhav Architecture">
          <img
            className="logo-image"
            src={websiteLogo}
            alt="Ishwari Jadhav Architecture"
          />
        </a>

        <a className="explore-button" href="#projects">
          Explore
        </a>
      </section>
    </main>
  )
}

export default Home
