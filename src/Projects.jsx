import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { useIsMobile } from './hooks/useIsMobile'
import { useBookSize } from './hooks/useBookSize'
import { client }  from './contentful.js';
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";


function getInitialSlug(projects, initialProjectSlug) {
  if (initialProjectSlug) {
    return initialProjectSlug
  }

  if (typeof window !== 'undefined') {
    const hashSlug = window.location.hash.replace('#', '')
    return hashSlug || projects[0]?.slug
  }

  return projects[0]?.slug
}

function useProjects() {
  let [pages, setPages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.getEntries(
          {
            content_type: "testContent",
          }
        );
        console.log('Response', response.items);
        setPages(response.items.map((item) => ({
          title: item.fields.title,
          description: item.fields.description,
          image: `https:${item.fields.projectImage.fields.file.url}`,
          slug: item.fields.slug,
        })));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  console.log('Pages', pages);
  return pages;
}

const ProjectSpread = forwardRef(function ProjectSpread({ project , activeIndex, projectLength, isMobile }, ref) {
  console.log('Title', project.title);
  
  if (isMobile) {
      return (
        
        <article className="project-spread-mobile" ref={ref}>
          <div className="project-spread-inner-mobile">
            <section className="project-type-panel-mobile">
              <p className="breadcrumbs-mobile">Project Details 
                <hr style={{ borderTop: `2px solid rgb(0, 0, 0)`,width: `5%`,marginLeft: `0` } } />
              </p>
              
              <h1>{project.title}</h1>
              <p className="description-mobile ">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
              <p className="description-mobile">{activeIndex + 1}/{projectLength}</p>
            </section>

            <section className="project-detail-panel-mobile">
              <div className="project-image-frame-mobile">
                <img src={project.image} alt={project.imageAlt} />
              </div>
            </section>
          </div>
        </article>
      )
  }
  return (
    <article className="project-spread" ref={ref}>
      <div className="project-spread-inner">
        <section className="project-type-panel">
          <p className="breadcrumbs">Project Details 
            <hr style={{ borderTop: `2px solid rgb(0, 0, 0)`,width: `5%`,marginLeft: `0` } } />
          </p>
          
          <h1>{project.title}</h1>
          <p className="description">{documentToReactComponents(

          project.description

        )}</p>
          <p className="description">{activeIndex + 1}/{projectLength}</p>
        </section>

        <section className="project-detail-panel">
          

          <div className="project-image-frame">
            <img src={project.image} alt={project.imageAlt} />
          </div>
        </section>
      </div>
    </article>
  )
})

function Projects() {
  const projects = useProjects();
  console.log('Projects', projects);
  let initialProjectSlug = null;
  const isMobile = useIsMobile()
  const { width, height } = useBookSize();
  console.log('WIDTH'+width);
  console.log('HEIGHT'+height);
  
  const [activeSlug, setActiveSlug] = useState(() =>
    getInitialSlug(projects, initialProjectSlug),
  )
  
  const bookRef = useRef()

  const activeIndex = useMemo(() => {
    const index = projects.findIndex((project) => project.slug === activeSlug)
    return index >= 0 ? index : 0
  }, [activeSlug, projects])

  useEffect(() => {
    const pageFlip = bookRef.current?.pageFlip?.()

    if (!pageFlip || pageFlip.getState() !== 'read') {
      return
    }

    if (pageFlip.getCurrentPageIndex() !== activeIndex) {
      pageFlip.turnToPage(activeIndex)
    }
  }, [activeIndex])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${activeSlug}`)
    }
  }, [activeSlug])

  const setActiveProject = useCallback(
    (index) => {
      const nextProject = projects[index]
      if (!nextProject) {
        return
      }

      setActiveSlug(nextProject.slug)
    },
    [projects],
  )

  const goToProject = useCallback(
    (index) => {
      const nextIndex = Math.min(Math.max(index, 0), projects.length - 1)
      const pageFlip = bookRef.current?.pageFlip?.()

      if (!pageFlip) {
        setActiveProject(nextIndex)
        return
      }

      if (nextIndex === activeIndex + 1) {
        setActiveProject(nextIndex)
        pageFlip.flipNext('top')
        return
      }

      if (nextIndex === activeIndex - 1) {
        setActiveProject(nextIndex)
        pageFlip.flipPrev('top')
        return
      }

      setActiveProject(nextIndex)
      pageFlip.turnToPage(nextIndex)
    },
    [activeIndex, projects.length, setActiveProject],
  )

  const handleFlip = useCallback(
    (event) => {
      setActiveProject(event.data)
    },
    [setActiveProject],
  )

  if (isMobile) {
    return (
      /*Start of Mobile View*/
      <main className="projects-mobile-view" aria-label="Project details">
        <div className="projects-mobile-view">
          <HTMLFlipBook
            width={400}
            height={852}
            showCover={false}
            ref={bookRef}
            onFlip={handleFlip}
          >
            {projects.map((project) => (
              <ProjectSpread key={project.slug} project={project} activeIndex={activeIndex} projectLength={projects.length} isMobile={isMobile} />
            ))}
          </HTMLFlipBook>
        </div>

        <ProjectControls
          activeIndex={activeIndex}
          onGoToProject={goToProject}
          projects={projects}
        />
      </main>
      /*End of Mobile View*/
    )
  }

  return (
    /*Start of Desktop View*/
    <main className="projects-page" aria-label="Project details">
      <div className="projects-desktop-view">
        <HTMLFlipBook
          width={width}
          height={height}
          showCover={false}
          ref={bookRef}
          onFlip={handleFlip}
        >
          {projects.map((project) => (
            <ProjectSpread key={project.slug} project={project} activeIndex={activeIndex} projectLength={projects.length} isMobile={isMobile} />
          ))}
        </HTMLFlipBook>
      </div>

      <ProjectControls
        activeIndex={activeIndex}
        onGoToProject={goToProject}
        projects={projects}
      />
    </main>
    /*End of Desktop View*/
  )
}

function ProjectControls({ activeIndex, onGoToProject, projects }) {
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
          disabled={projects.length === 0}
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()

            if (isLastProject) {
              window.location.href = '/about'
              return
            }

            onGoToProject(activeIndex + 1)
          }}
        >
          {isLastProject ? 'About Me' : 'Next'}
        </button>
      </div>
    </div>
  )
}

export default Projects
