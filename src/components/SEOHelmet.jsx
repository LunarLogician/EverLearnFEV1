import { Helmet } from 'react-helmet-async';

export function SEOHelmet({ 
  title = "EverlearnAI — MCQ Prep, Quizzes, Flashcards & Document Q&A",
  description = "Study smarter with EverlearnAI: generate MCQs, quizzes and flashcards from any topic or file, chat with your documents, and get assignment help. Start free.",
  image = "/og-image.png",
  url = "https://everlearn.ai",
  keywords = "MCQ generator, quiz maker, flashcards, AI homework help, document Q&A, study tools"
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
