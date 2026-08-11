import { useParams } from "react-router-dom";
import { projects } from "../data/projects";

function ProjectDetail() {
    const { slug } = useParams();
    const project = projects.find((item) => item.slug === slug);

    if (!project) {
        return (
            <section className="container section page-section narrow">
                <p className="eyebrow">Project</p>
                <h1 className="page-title">Project not found</h1>
                <p className="page-text">
                    The project you are looking for does not exist.
                </p>
            </section>
        );
    }

    return (
        <section className="container section page-section narrow">
            <p className="eyebrow">Project</p>
            <h1 className="page-title">{project.title}</h1>

            <div className="status-badge">{project.status}</div>

            {project.skills?.length ? (
                <div className="project-detail-section">
                    <h3 className="project-detail-heading">Skills</h3>
                    <div className="project-skills project-skills-detail">
                        {project.skills.map((skill) => (
                            <span key={skill} className="project-skill">
                                {skill}
                            </span>
                        ))}
                    </div>
                    <h2> </h2>
                </div>
            ) : null}

            <div className="project-detail-content">
                {project.fullDescription.map((paragraph) => (
                    <p key={paragraph} className="page-text">
                        {paragraph}
                    </p>
                ))}
            </div>
        </section>
    );
}

export default ProjectDetail;