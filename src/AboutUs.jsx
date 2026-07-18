import { useEffect, useCallback, useState } from 'react'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import websiteLogo from './assets/website_logo2.png'
import { client } from './contentful.js'

const ABOUT_CONTENT_TYPE = import.meta.env.VITE_CONTENTFUL_ABOUT_CONTENT_TYPE || 'aboutus'
const PROJECT_CONTENT_TYPE = 'testContent'

function renderDescription(description) {
  if (!description) {
    return null
  }

  if (typeof description === 'string') {
    return <p>{description}</p>
  }

  return documentToReactComponents(description)
}

function AboutUs() {
  const [aboutPage, setAboutPage] = useState(null)
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading')
  const [projectsStatus, setProjectsStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    async function fetchContent() {
      try {
        const [aboutResponse, projectResponse] = await Promise.all([
          client.getEntries({
            content_type: ABOUT_CONTENT_TYPE,
            limit: 1,
          }),
          client.getEntries({
            content_type: PROJECT_CONTENT_TYPE,
          }),
        ])

        if (!isMounted) {
          return
        }

        const entry = aboutResponse.items[0]
        setAboutPage({
          title: entry?.fields?.header || entry?.fields?.title || 'About Us',
          description: entry?.fields?.description,
        })
        setProjects(
          projectResponse.items
            .map((item) => ({
              title: item.fields.title,
              slug: item.fields.slug,
              description: item.fields.description,
              image: `https:${item.fields.projectImage.fields.file.url}`,
            }))
            .filter((project) => project.title && project.slug),
        )
        setStatus('ready')
        setProjectsStatus('ready')
      } catch (error) {
        console.error('Unable to load About Us content', error)

        if (isMounted) {
          setStatus('error')
          setProjectsStatus('error')
        }
      }
    }

    fetchContent()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="about-page" aria-label="About Ishwari Jadhav Architecture">
      <section className="about-spread">
        <section className="about-type-panel">
          <p className="about-breadcrumbs">
            About Us
            <span aria-hidden="true" />
          </p>

          {status === 'loading' && <p className="about-loading">Loading...</p>}
          {status === 'error' && (
            <p className="about-loading">Unable to load about page content.</p>
          )}
          {status === 'ready' && (
            <>
              <h1>{aboutPage.title}</h1>
              <div className="about-description">
                {renderDescription(aboutPage.description)}
              </div>
            </>
          )}
        </section>

        <section className="about-detail-panel" aria-label="Studio identity">
          <a className="about-logo" href={import.meta.env.BASE_URL} aria-label="Ishwari Jadhav Architecture">
            <img
              className="about-logo-image"
              src={websiteLogo}
              alt="Ishwari Jadhav Architecture"
            />
          </a>
        </section>

        <nav className="about-projects" aria-label="View projects">
          <a className="about-cover-link" href={import.meta.env.BASE_URL}>
            Go to cover page
          </a>
          <a className="about-projects-trigger" href={`${import.meta.env.BASE_URL}projects`}>
            View Projects
          </a>
          <div className="about-projects-menu">
            {projectsStatus === 'loading' && <p>Loading projects...</p>}
            {projectsStatus === 'error' && <p>Unable to load projects.</p>}
            {projectsStatus === 'ready' &&
              projects.map((project, projectIndex) => (
                <a href={`${import.meta.env.BASE_URL}projects#${encodeURIComponent(project.slug)}`} key={project.slug}>
                  <span>{String(projectIndex + 1).padStart(2, '0')}</span>
                  {project.title}
                </a>
              ))}
          </div>
        </nav>
      </section>
    </main>
  )
}

export default AboutUs
