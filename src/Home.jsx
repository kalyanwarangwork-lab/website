import magazineImage from './assets/magazine-home.png'
import websiteLogo from './assets/website_logo2.png'

function Home() {
  return (
    <main className="home-spread" aria-label="Ishwari Jadhav Architecture">
      <div className="home-spread-inner">
        <section className="home-type-panel">
          <p className="breadcrumbs">
            Architecture Studio
            <span aria-hidden="true" />
          </p>
          <img className="home-logo-image" src={websiteLogo} alt="Ishwari Jadhav Architecture" />
          <div className="home-footer">
            <a className="home-explore-button" href="#projects">Explore</a>
          </div>
        </section>

        <section className="home-detail-panel">
          <img className="home-cover-image" src={magazineImage} alt="Sunlit contemporary architecture interior with natural stone, wood, and garden views" />
        </section>
      </div>
    </main>
  )
}

export default Home
