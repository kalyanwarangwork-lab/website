import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { useIsMobile } from './hooks/useIsMobile'
import { useBookSize } from './hooks/useBookSize'
import { client }  from './contentful.js';
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import websiteLogo from './assets/website_logo2.png'

const PROJECT_CONTENT_TYPE = import.meta.env.VITE_CONTENTFUL_PROJECT_CONTENT_TYPE || 'testContent'
const ABOUT_CONTENT_TYPE = import.meta.env.VITE_CONTENTFUL_ABOUT_CONTENT_TYPE || 'aboutus'
const ABOUT_SLUG = '__about__'

function getHashSlug() {
  if (typeof window === 'undefined') {
    return null
  }

  const hashSlug = window.location.hash.replace('#', '')

  if (!hashSlug) {
    return null
  }

  try {
    return decodeURIComponent(hashSlug)
  } catch {
    return hashSlug
  }
}

function renderRichText(description) {
  if (!description) {
    return null
  }

  if (typeof description === 'string') {
    return <p>{description}</p>
  }

  return documentToReactComponents(description)
}

function useProjects() {
  const [pages, setPages] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.getEntries({
          content_type: PROJECT_CONTENT_TYPE,
        });
        setPages(response.items.map((item) => ({
          title: item.fields.title,
          location: item.fields.location || null,
          description: item.fields.description,
          image: `https:${item.fields.projectImage.fields.file.url}?w=1400&fm=webp&q=80`,
          imageAlt: item.fields.projectImage.fields.description || item.fields.title,
          slug: item.fields.slug,
          collageImages: (item.fields.collageImages || []).map((img) => ({
            url: `https:${img.fields.file.url}?w=1400&fm=webp&q=82`,
            thumbUrl: `https:${img.fields.file.url}?w=400&h=400&fit=thumb&fm=webp&q=75`,
            alt: img.fields.description || img.fields.title || '',
          })),
        })));
      } catch (error) {
        console.error(error);
      } finally {
        setReady(true);
      }
    };
    fetchData();
  }, []);

  return { pages, ready };
}

function useAboutContent() {
  const [aboutPage, setAboutPage] = useState(null)

  useEffect(() => {
    client
      .getEntries({ content_type: ABOUT_CONTENT_TYPE, limit: 1 })
      .then((response) => {
        const entry = response.items[0]
        if (!entry) return
        setAboutPage({
          title: entry.fields?.header || entry.fields?.title || 'About Us',
          description: entry.fields?.description,
        })
      })
      .catch(console.error)
  }, [])

  return aboutPage
}

const AboutUsLastPage = forwardRef(function AboutUsLastPage({ aboutPage, projects, isMobile, onGoToProject }, ref) {
  if (isMobile) {
    return (
      <article className="project-spread-mobile" ref={ref}>
        <div className="project-header-mobile">
          <p className="breadcrumbs-mobile">
            About Us
            <span aria-hidden="true" />
          </p>
          {aboutPage && <h1>{aboutPage.title}</h1>}
        </div>
        <div className="project-image-mobile about-logo-panel-mobile">
          <img src={websiteLogo} alt="Ishwari Jadhav Architecture" />
        </div>
        <div className="project-body-mobile">
          {aboutPage && (
            <div className="description-mobile">
              {renderRichText(aboutPage.description)}
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <div className="about-page about-last-page" ref={ref}>
      <section className="about-spread">
        <section className="about-type-panel">
          <p className="about-breadcrumbs">
            About Us
            <span aria-hidden="true" />
          </p>
          {aboutPage && (
            <>
              <h1>{aboutPage.title}</h1>
              <div className="about-description">
                {renderRichText(aboutPage.description)}
              </div>
            </>
          )}
        </section>

        <section className="about-detail-panel" aria-label="Studio identity">
          <a className="about-logo" href="/" aria-label="Ishwari Jadhav Architecture">
            <img
              className="about-logo-image"
              src={websiteLogo}
              alt="Ishwari Jadhav Architecture"
            />
          </a>
        </section>

        <nav className="about-projects" aria-label="View projects">
          <a className="about-cover-link" href="#">
            Go to cover page
          </a>
          <a className="about-projects-trigger" href="#projects">
            View Projects
          </a>
          <div className="about-projects-menu">
            {projects.map((project, i) => (
              <a
                href={`#${encodeURIComponent(project.slug)}`}
                key={project.slug}
                onClick={(e) => { e.preventDefault(); onGoToProject(i) }}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                {project.title}
              </a>
            ))}
          </div>
        </nav>
      </section>
    </div>
  )
})

function ProjectsHeader() {
  return (
    <header className="projects-header">
      <a href="#" className="projects-header-logo" aria-label="Ishwari Jadhav Architecture">
        <img src={websiteLogo} alt="Ishwari Jadhav Architecture" />
      </a>
      <a href="#" className="projects-header-cover-link">
        Go to cover page
      </a>
    </header>
  )
}

function ImagePreview({ images, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex(i => Math.min(images.length - 1, i + 1))
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [images.length, onClose])

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview-content" onClick={e => e.stopPropagation()}>
        <button className="preview-close" onClick={onClose} aria-label="Close preview">×</button>
        <button
          className="preview-nav preview-prev"
          onClick={() => setIndex(i => i - 1)}
          disabled={index === 0}
          aria-label="Previous image"
        >‹</button>
        <img className="preview-image" src={images[index].url} alt={images[index].alt} />
        <button
          className="preview-nav preview-next"
          onClick={() => setIndex(i => i + 1)}
          disabled={index === images.length - 1}
          aria-label="Next image"
        >›</button>
        <p className="preview-counter">{index + 1} / {images.length}</p>
      </div>
    </div>
  )
}

function CollageSlider({ images, columns = 3 }) {
  const [startIndex, setStartIndex] = useState(0)
  const [previewIndex, setPreviewIndex] = useState(null)

  if (!images || images.length === 0) return null

  const canPrev = startIndex > 0
  const canNext = startIndex + columns < images.length

  return (
    <>
      <div className="collage-slider">
        <button
          className="collage-slider-arrow"
          onClick={() => setStartIndex(i => Math.max(0, i - 1))}
          disabled={!canPrev}
          aria-label="Previous images"
        >‹</button>
        <div className="collage-slider-track" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {images.slice(startIndex, startIndex + columns).map((img, i) => (
            <button
              key={startIndex + i}
              className="collage-thumb"
              onClick={() => setPreviewIndex(startIndex + i)}
              aria-label={`View image ${startIndex + i + 1}`}
            >
              <img src={img.thumbUrl || img.url} alt={img.alt} />
            </button>
          ))}
        </div>
        <button
          className="collage-slider-arrow"
          onClick={() => setStartIndex(i => Math.min(images.length - columns, i + 1))}
          disabled={!canNext}
          aria-label="Next images"
        >›</button>
      </div>
      {previewIndex !== null && (
        <ImagePreview images={images} initialIndex={previewIndex} onClose={() => setPreviewIndex(null)} />
      )}
    </>
  )
}

function MobileProjectCard({ project, index, projectLength, activeIndex, onGoToProject, className }) {
  const isFirst = activeIndex === 0
  const isLast = activeIndex === projectLength - 1
  return (
    <article className={`project-spread-mobile ${className}`}>
      <div className="project-header-mobile">
        <p className="breadcrumbs-mobile">Project Details<span aria-hidden="true" /></p>
        <div className="project-title-block">
          <h1>{project.title}</h1>
          {project.location && <p className="project-location">{project.location}</p>}
        </div>
      </div>
      <div className="project-image-mobile">
        <img src={project.image} alt={project.imageAlt} />
      </div>
      <div className="project-body-mobile">
        <div className="description-mobile">{renderRichText(project.description)}</div>
        <CollageSlider images={project.collageImages} columns={2} />
        <div className="project-page-footer-mobile">
          <span className="project-counter-mobile">{index + 1}/{projectLength}</span>
          <div className="project-page-nav-mobile">
            <button type="button" disabled={isFirst}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onGoToProject(activeIndex - 1) }}>
              Prev
            </button>
            <button type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onGoToProject(activeIndex + 1) }}>
              {isLast ? 'Know About Me' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function MobileAboutCard({ aboutPage, onGoToProject, className }) {
  return (
    <article className={`project-spread-mobile ${className}`}>
      <div className="project-header-mobile">
        <p className="breadcrumbs-mobile">About Us<span aria-hidden="true" /></p>
        {aboutPage && <h1>{aboutPage.title}</h1>}
      </div>
      <div className="project-image-mobile about-logo-panel-mobile">
        <img src={websiteLogo} alt="Ishwari Jadhav Architecture" />
      </div>
      <div className="project-body-mobile">
        {aboutPage && <div className="description-mobile">{renderRichText(aboutPage.description)}</div>}
        <div className="project-page-footer-mobile">
          <span className="project-counter-mobile" />
          <div className="project-page-nav-mobile">
            <button type="button" onClick={(e) => { e.preventDefault(); onGoToProject(0) }}>
              View Projects
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function MobileView({ activeIndex, slideDirection, projects, aboutPage, onGoToProject }) {
  const DURATION = 400
  const [transition, setTransition] = useState({ current: activeIndex, prev: null })

  useEffect(() => {
    if (activeIndex === transition.current) return
    const prev = transition.current
    setTransition({ current: activeIndex, prev })
    const timer = setTimeout(() => setTransition({ current: activeIndex, prev: null }), DURATION)
    return () => clearTimeout(timer)
  }, [activeIndex])

  const renderCard = (index, className) => {
    if (index >= projects.length) {
      return <MobileAboutCard key="about" aboutPage={aboutPage} onGoToProject={onGoToProject} className={className} />
    }
    return (
      <MobileProjectCard
        key={index}
        project={projects[index]}
        index={index}
        projectLength={projects.length}
        activeIndex={index}
        onGoToProject={onGoToProject}
        className={className}
      />
    )
  }

  const isAnimating = transition.prev !== null

  return (
    <div className="mobile-flip-container">
      {isAnimating && renderCard(transition.prev, `mobile-exit-${slideDirection}`)}
      {renderCard(transition.current, isAnimating ? `mobile-enter-${slideDirection}` : '')}
    </div>
  )
}

const ProjectSpread = memo(forwardRef(function ProjectSpread({ project, index, projectLength, onGoToProject }, ref) {
  const isFirst = index === 0
  const isLast = index === projectLength - 1

  return (
    <article className="project-spread" ref={ref}>
      <div className="project-spread-inner">
        <section className="project-type-panel">
          <p className="breadcrumbs">Project Details
            <span aria-hidden="true" />
          </p>
          <div className="project-title-block">
            <h1>{project.title}</h1>
            {project.location && <p className="project-location">{project.location}</p>}
          </div>
          <div className="project-type-body">
            <div className="description">
              {renderRichText(project.description)}
            </div>
            <CollageSlider images={project.collageImages} columns={3} />
            <div className="project-page-footer">
              <span className="project-counter">{index + 1}/{projectLength}</span>
              <div className="project-page-nav">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onGoToProject(index - 1) }}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onGoToProject(index + 1) }}
                >
                  {isLast ? 'Know About Me' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="project-detail-panel">
          <div className="project-image-frame">
            <img src={project.image} alt={project.imageAlt} />
          </div>
        </section>
      </div>
    </article>
  )
}))

function Projects() {
  const { pages: projects, ready } = useProjects();
  const aboutPage = useAboutContent();
  const isMobile = useIsMobile()
  const { width, height } = useBookSize();

  const [activeSlug, setActiveSlug] = useState(getHashSlug)
  const [slideDirection, setSlideDirection] = useState('next')

  const bookRef = useRef()
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const activeIndexRef = useRef(0)
  const isMobileRef = useRef(isMobile)

  const selectedSlug = useMemo(() => {
    if (activeSlug === ABOUT_SLUG) return ABOUT_SLUG
    if (activeSlug && projects.some((project) => project.slug === activeSlug)) {
      return activeSlug
    }

    return getHashSlug() || projects[0]?.slug
  }, [activeSlug, projects])

  const activeIndex = useMemo(() => {
    if (selectedSlug === ABOUT_SLUG) return projects.length
    const index = projects.findIndex((project) => project.slug === selectedSlug)
    return index >= 0 ? index : 0
  }, [selectedSlug, projects])

  useEffect(() => {
    if (projects.length === 0) {
      return
    }

    const pageFlip = bookRef.current?.pageFlip?.()

    if (!pageFlip || pageFlip.getState() !== 'read') {
      return
    }

    if (pageFlip.getCurrentPageIndex() !== activeIndex) {
      pageFlip.turnToPage(activeIndex)
    }
  }, [activeIndex, projects.length])

  useEffect(() => { activeIndexRef.current = activeIndex }, [activeIndex])
  useEffect(() => { isMobileRef.current = isMobile }, [isMobile])

  // Preload adjacent page images so the next flip doesn't wait on network
  useEffect(() => {
    if (projects.length === 0) return
    const srcs = [
      projects[activeIndex - 1]?.image,
      projects[activeIndex + 1]?.image,
    ].filter(Boolean)
    srcs.forEach((src) => { new Image().src = src })
  }, [activeIndex, projects])

  useEffect(() => {
    if (typeof window === 'undefined' || !selectedSlug) return
    if (selectedSlug === ABOUT_SLUG) {
      window.history.replaceState(null, '', '#about')
    } else {
      window.history.replaceState(null, '', `#${encodeURIComponent(selectedSlug)}`)
    }
  }, [selectedSlug])

  const setActiveProject = useCallback(
    (index) => {
      if (index >= projects.length) {
        setActiveSlug(ABOUT_SLUG)
        return
      }

      const nextProject = projects[index]
      if (!nextProject) {
        return
      }

      setActiveSlug(nextProject.slug)
    },
    [projects],
  )

  const goToProject = useCallback(
    (targetIndex) => {
      const currentIndex = activeIndexRef.current
      if (isMobileRef.current) {
        setSlideDirection(targetIndex >= currentIndex ? 'next' : 'prev')
      }
      const pageFlip = bookRef.current?.pageFlip?.()

      if (targetIndex >= projects.length) {
        if (pageFlip) {
          pageFlip.flipNext('bottom')
        } else {
          setActiveProject(projects.length)
        }
        return
      }

      const nextIndex = Math.min(Math.max(targetIndex, 0), projects.length - 1)

      if (!pageFlip) {
        setActiveProject(nextIndex)
        return
      }

      if (nextIndex === currentIndex + 1) {
        pageFlip.flipNext('bottom')
        return
      }

      if (nextIndex === currentIndex - 1) {
        pageFlip.flipPrev('bottom')
        return
      }

      setActiveProject(nextIndex)
      pageFlip.turnToPage(nextIndex)
    },
    [projects.length, setActiveProject],
  )

  const handleFlip = useCallback(
    (event) => {
      setActiveProject(event.data)
    },
    [setActiveProject],
  )

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const current = activeIndexRef.current
      if (deltaX < 0) goToProject(current + 1)
      else goToProject(current - 1)
    }
  }, [goToProject])

  if (!ready) {
    return <main className="projects-loading" aria-label="Loading projects" />
  }

  if (isMobile) {
    return (
      <main
        className="projects-mobile-view"
        aria-label="Project details"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ProjectsHeader />
        <MobileView
          activeIndex={activeIndex}
          slideDirection={slideDirection}
          projects={projects}
          aboutPage={aboutPage}
          onGoToProject={goToProject}
        />
      </main>
    )
  }

  return (
    <main className="projects-page" aria-label="Project details">
      <ProjectsHeader />
      <div className="projects-desktop-view">
        <HTMLFlipBook
          width={width}
          height={height}
          showCover={false}
          startPage={activeIndex}
          ref={bookRef}
          onFlip={handleFlip}
          useMouseEvents={false}
        >
          {projects.map((project, index) => (
            <ProjectSpread key={project.slug} project={project} index={index} projectLength={projects.length} onGoToProject={goToProject} />
          ))}
          <AboutUsLastPage aboutPage={aboutPage} projects={projects} isMobile={false} onGoToProject={goToProject} />
        </HTMLFlipBook>
      </div>
    </main>
  )
}

function ProjectControls({ activeIndex, onGoToProject, projects }) {
  const isOnAboutPage = activeIndex >= projects.length
  const isLastProject = activeIndex === projects.length - 1
  return (
    <div className="project-bottom-bar project-global-bottom-bar">
      <div className="project-controls" aria-label="Project navigation">
        <button
          disabled={activeIndex === 0}
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onGoToProject(activeIndex - 1)
          }}
        >
          Prev
        </button>
        <button
          disabled={projects.length === 0 || isOnAboutPage}
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onGoToProject(activeIndex + 1)
          }}
        >
          {isLastProject ? 'Know About Me' : 'Next'}
        </button>
      </div>
    </div>
  )
}

export default Projects
