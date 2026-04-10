import { Helmet } from 'react-helmet-async';

export function SEOHelmet({ 
  title = "EverlearnAI — AI Study Tools | MCQ Generator, Quiz Maker & Flashcards",
  description = "AI-powered study tools for students. Generate MCQs, quizzes, and flashcards from any topic. Chat with AI tutor 24/7 for homework help and exam prep. Start free.",
  image = "/logo.png",
  url = "https://everlearn.ai",
  keywords = "AI study tools, AI tools for studying, AI tutor, MCQ generator, quiz maker, flashcard generator, AI homework help, exam prep, study assistant AI"
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="EverLearnAI" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Open Graph for Social Sharing */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
