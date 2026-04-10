import { Helmet } from 'react-helmet-async';

export function StructuredData() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "EverlearnAI",
    "description": "AI-powered study tools for students — generate MCQs, quizzes, flashcards, chat with documents, and get instant homework help.",
    "url": "https://everlearn.ai",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "3.21",
      "priceCurrency": "USD",
      "offerCount": "3"
    },
    "author": {
      "@type": "Organization",
      "name": "EverLearnAI",
      "url": "https://everlearn.ai"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "250"
    }
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EverlearnAI",
    "url": "https://everlearn.ai",
    "logo": "https://everlearn.ai/logo.png",
    "description": "AI-powered study platform helping students ace exams with MCQs, quizzes, flashcards, and AI tutoring.",
    "sameAs": []
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is EverlearnAI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "EverlearnAI is an AI-powered study platform that helps students generate MCQs, quizzes, and flashcards from any topic or document. It also provides a 24/7 AI tutor for homework help, document Q&A, and assignment assistance."
        }
      },
      {
        "@type": "Question",
        "name": "Is EverlearnAI free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! EverlearnAI offers 10,000 free tokens when you sign up, with no credit card required. Paid plans start from RS 399/month (~$1.41) for 200K tokens."
        }
      },
      {
        "@type": "Question",
        "name": "Can I upload documents and ask questions about them?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. EverlearnAI supports PDF, DOCX, and PPTX uploads. You can chat with your documents, ask specific questions about any page or chapter, and get accurate AI-generated answers instantly."
        }
      },
      {
        "@type": "Question",
        "name": "What AI tools does EverlearnAI offer for studying?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "EverlearnAI offers an AI Chat tutor, MCQ Generator, Quiz Generator, Flashcard Generator, Document Q&A, Assignment Help, and Exam Paper Generator — all powered by AI."
        }
      },
      {
        "@type": "Question",
        "name": "How does the AI MCQ generator work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply paste a topic, your notes, or upload a document. EverlearnAI's AI instantly generates multiple-choice questions with correct answers and explanations, perfect for exam practice."
        }
      }
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EverlearnAI",
    "url": "https://everlearn.ai",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://everlearn.ai/chat?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(softwareSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
}
