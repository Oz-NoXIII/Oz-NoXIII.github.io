import { projectImages } from '../assets/index.js';

export const projects = [
    {
        slug: "angel-portfolio-game",
        title: "Metanoia: The Interactive Portfolio",
        image: projectImages.angelPortfolioGame,
        shortDescription:
            "An interactive portfolio designed as a game experience inspired by my academic journey.",
        fullDescription: [
            "Metanoia is an experimental portfolio built as an interactive experience. ",
            "Rather than navigating a traditional site, the visitor discovers projects and ideas through levels inspired by my academic journey. ",
            "The project explores game-like navigation, interaction design, and real-time rendering to transform a portfolio into an immersive experience. ",
            "Each level introduces different mechanics, encouraging exploration instead of linear browsing. ",
            "Currently in development."
        ],
        tags: ["Interactive", "Creative Coding", "Web-based Game"],
        skills: [
            "Three.js",
            "JavaScript",
            "Interaction Design",
            "Real-time Rendering",
            "UX Thinking"
        ],
        status: "Ongoing",
        featured: true
    },

    {
        slug: "xpath-query-containment",
        title: "XPath Query Containment",
        image: projectImages.xpathQueryContainment,
        shortDescription:
            "Master's thesis on XPath query containment and equivalence, with a Python web app implementing the algorithms.",
        fullDescription: [
            "Master's thesis studying query containment for a restricted fragment of XPath, with applications to query optimization.",
            "Formalized the translation from XPath to tree pattern queries (TPQs) and identified the limits of this correspondence, showing the two formalisms are not equivalent.",
            "Worked through the homomorphism-based methods from the literature for testing query containment to produce a more detailed and rigorous explanation than the original sources.",
            "Built a Python web application implementing the full pipeline: parsing XPath, constructing tree patterns, and testing containment and equivalence between queries.",
            "Restructured dense results from the literature into a clearer, more didactic presentation suitable for bachelor-level students.",
            "Defended in June 2026, under the supervision of Prof. Jef Wijsen at the University of Mons."
        ],
        tags: ["Master's Thesis", "Databases", "Algorithms", "Python"],
        skills: [
            "Formal Reasoning",
            "Database Theory",
            "Algorithm Design & Implementation",
            "Python",
            "Technical Communication"
        ],
        status: "Completed"
    },

    {
        slug: "apache-ozone-ha-poc",
        title: "Apache Ozone HA POC",
        image: projectImages.apacheOzoneHaPoc,
        shortDescription:
            "Proof of concept for a distributed Apache Ozone cluster with high availability.",
        fullDescription: [
            "Proof of concept for deploying and validating a high-availability Apache Ozone cluster in a distributed environment.",
            "The work focused on cluster configuration, replication strategies, and failover behavior to ensure system reliability.",
            "It included testing, validation of features, and documentation of the setup.",
            "A Python Shiny interface was developed to present the system and make it accessible for demonstration purposes."
        ],
        tags: ["Distributed Systems", "Apache Ozone", "Infrastructure", "High Availability"],
        skills: [
            "Distributed Systems",
            "Linux",
            "Cluster Configuration",
            "Fault Tolerance",
            "System Validation",
            "Technical Documentation"
        ],
        status: "Completed"
    },

    {
        slug: "fire-detection-classification",
        title: "Fire Detection Classification",
        image: projectImages.fireDetectionClassification,
        shortDescription:
            "Deep learning project for fire image classification with semantic evaluation and explainability.",
        fullDescription: [
            "Deep learning project focused on fire image classification using convolutional neural networks.",
            "The work included data preparation, model design, training, and evaluation using PyTorch Lightning.",
            "A custom Earth Mover’s Distance loss was implemented to better capture semantic relationships between classes.",
            "The project also explored explainability methods to better understand model predictions."
        ],
        tags: [ "PyTorch", "Computer Vision", "Real Use Case"],
        skills: [
            "PyTorch",
            "PyTorch Lightning",
            "Computer Vision",
            "Model Training",
            "Evaluation Metrics",
            "Explainability (XAI)"
        ],
        status: "Completed"
    },

    {
        slug: "dnn-compression-explainability",
        title: "DNN Compression & Explainability",
        image: projectImages.dnnCompressionExplainability,
        shortDescription:
            "Interactive framework to explore model compression and explainability in deep learning.",
        fullDescription: [
            "Interactive framework designed to explore compression and explainability techniques for deep neural networks.",
            "The system combines a Flask API with a local interface to experiment with pruning, distillation, and quantization.",
            "Explainability tools are integrated to visualize and better understand model behavior.",
            "The project is structured around a custom MVC architecture to support modular experimentation."
        ],
        tags: ["Deep Learning", "Model Compression", "XAI", "Framework"],
        skills: [
            "PyTorch",
            "PyTorch Lightning",
            "Computer Vision",
            "Model Training",
            "Evaluation Metrics",
            "Explainability (XAI)"
        ],
        status: "Completed"
    },
    {
        slug: "expression-parser",
        title: "Expression Parser For A Calculator",
        image: projectImages.expressionParser,
        shortDescription:
            "Scientific Calculator's parser supporting prefix, infix, and postfix expressions with structured AST representation.",
        fullDescription: [
            "Implementation of an expression parser for a scientific calculator supporting prefix, infix, and postfix notation.",
            "The project focuses on parsing strategies, abstract syntax tree construction, and conversion between representations.",
            "It handles flexible input formats and explores operator precedence and normalization of expressions.",
            "Designed with extensibility and clean structure in mind."
        ],
        tags: ["Parsing", "Algorithms", "Software Design"],
        skills: [
            "Python",
            "Parsing",
            "AST Design",
            "Algorithms",
            "Software Architecture"
        ],
        status: "Completed"
    },
    {
        slug: "vanheede-optimization-platform",
        title: "Transportation Optimization Website",
        image: projectImages.vanheede,
        shortDescription:
            "End-to-end software project to support optimization of waste treatment processes.",
        fullDescription: [
            "End-to-end software development project carried out in collaboration with Vanheede, focused on optimizing waste treatment processes.",
            "The project involved gathering requirements through direct communication with the client, translating needs into technical specifications, and iterating based on feedback.",
            "It included modeling, development, testing, and deployment of a web-based solution.",
            "A strong emphasis was placed on adaptability, continuous communication, and aligning technical decisions with evolving business needs."
        ],
        tags: ["Software Engineering", "Client Project", "Optimization"],
        skills: [
            "Full-stack Development",
            "Requirement Analysis",
            "System Modeling",
            "Testing & Validation",
            "Deployment",
            "Client Communication",
            "Collaboration inter-team"
        ],
        status: "Completed"
    },
    {
        slug: "bank-transfer-application",
        title: "Bank Transfer Application",
        image: projectImages.bankTransfer,
        shortDescription:
            "Software engineering project focused on system design and UML modeling.",
        fullDescription: [
            "Software engineering project involving the design of a bank transfer application.",
            "The work includes UML modeling, system architecture, and prototyping.",
            "The focus was on applying software engineering principles in a structured and realistic scenario.",
            "Version control and collaborative development practices were also used."
        ],
        tags: ["Software Engineering", "UML", "Java", "System Design"],
        skills: [
            "Java",
            "UML",
            "System Design",
            "Version Control",
            "Software Engineering"
        ],
        status: "Completed"
    },
    {
        slug: "transformer-text-classification",
        title: "Transformer Text Classification",
        image: projectImages.transformer,
        shortDescription:
            "Text classification using transformer-based models.",
        fullDescription: [
            "Project focused on text classification using transformer architectures such as DistilBERT.",
            "Includes data preprocessing, fine-tuning, and evaluation of model performance.",
            "Explores practical usage of pretrained models for NLP tasks."
        ],
        tags: ["NLP", "Transformers", "Semantics"],
        skills: [
            "Transformers",
            "PyTorch",
            "NLP",
            "Model Fine-tuning",
            "Data Preprocessing",
            "Evaluation"
        ],
        status: "Completed"
    },
    {
        slug: "dumbo-compiler",
        title: "Dumbo Language Compiler",
        image: projectImages.dumboCompiler,
        shortDescription:
            "Compiler implementation for a custom programming language.",
        fullDescription: [
            "Implementation of a compiler for a custom programming language called Dumbo.",
            "The project covers the full compilation pipeline, including lexical analysis, parsing, semantic analysis, and code generation.",
            "It focuses on language design, formal grammars, and transformation of high-level constructs into executable representations.",
            "The work highlights core concepts of compiler construction and low-level program representation."
        ],
        tags: ["Compiler", "Languages", "Parsing", "Theory"],
        skills: [
            "Compiler Design",
            "Lexical Analysis",
            "Parsing",
            "Formal Grammars",
            "Semantic Analysis",
            "Code Generation"
        ],
        status: "Completed"
    },
    {
        slug: "windowing-application",
        title: "Windowing Application",
        image: projectImages.windowing,
        shortDescription:
            "Implementation of geometric data structures for efficient windowing queries.",
        fullDescription: [
            "Implementation of a windowing application based on computational geometry algorithms.",
            "The project is inspired by the windowing problem described in 'Computational Geometry – Algorithms and Applications'.",
            "It focuses on efficient geometric data structures to perform range queries over spatial data.",
            "The work highlights algorithm design, complexity considerations, and practical implementation of theoretical concepts."
        ],
        tags: ["Computational Geometry", "Algorithms", "Data Structures"],
        skills: [
            "Computational Geometry",
            "Geometric Data Structures",
            "Algorithm Design",
            "Complexity Analysis",
            "Spatial Queries"
        ],
        status: "Completed"
    }
];