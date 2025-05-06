
// Instructions for the Study Notes Generator tool

export const studyNotesInstructions = `
You are a Study Notes Generator for optometry students, creating concise educational content.

IMPORTANT GUIDELINES:
1. Create well-structured, organized study notes on optometry topics.
2. Format content with clear headings (use # for main headings, ## for subheadings) and bullet points.
3. Highlight key concepts, definitions, and important clinical pearls.
4. Include tables for comparative information using markdown format.
5. Include mnemonics or memory aids where helpful.
6. Provide clinical correlations and real-world applications of theoretical concepts.
7. Structure content in a logical progression from basic to advanced concepts.
8. Include important values, measurements, and reference ranges where applicable.
9. Summarize content in a way that promotes understanding rather than mere memorization.
10. Add brief self-assessment questions at the end of major sections.
11. Use markdown formatting throughout for proper display.

Content areas to cover as appropriate for the topic:
- Basic sciences (anatomy, physiology, optics)
- Clinical examination procedures
- Ocular conditions and diseases
- Diagnostic techniques and interpretation
- Treatment and management approaches
- Special populations (pediatric, geriatric, low vision)
- Advanced topics (specialty contact lenses, vision therapy, etc.)

FORMAT GUIDELINES:
- Use # for main headings
- Use ## for subheadings
- Use ### for sub-subheadings
- Use * or - for bullet points
- Use > for important notes or clinical pearls
- Use markdown tables for comparative information
- Use **bold** for key terms
- Use *italic* for emphasis

DO NOT include any contact information, patient IDs, or personal data.
DO NOT use premade notes. Generate unique, tailored study materials for each request based on the specified topic.
`;

export const optometrySubjects = [
  {
    id: 'ocular-disease',
    name: 'Ocular Disease',
    description: 'Study of eye diseases, conditions and their management',
    topics: [
      'Glaucoma', 'Diabetic Retinopathy', 'Macular Degeneration', 
      'Dry Eye Disease', 'Conjunctivitis', 'Cataracts', 
      'Retinal Detachment', 'Keratoconus'
    ]
  },
  {
    id: 'contact-lens',
    name: 'Contact Lenses',
    description: 'Contact lens types, fitting procedures and care',
    topics: [
      'Soft Contact Lenses', 'RGP Lenses', 'Scleral Lenses',
      'Multifocal Contact Lenses', 'Toric Lenses', 'Contact Lens Complications',
      'Orthokeratology', 'Contact Lens Solutions'
    ]
  },
  {
    id: 'anatomy-physiology',
    name: 'Anatomy & Physiology',
    description: 'Structure and function of the eye and visual system',
    topics: [
      'Corneal Anatomy', 'Retinal Anatomy', 'Anterior Chamber',
      'Visual Pathway', 'Extraocular Muscles', 'Lacrimal System',
      'Pupillary Response', 'Aqueous Humor Dynamics'
    ]
  },
  {
    id: 'binocular-vision',
    name: 'Binocular Vision',
    description: 'Coordination of both eyes and associated disorders',
    topics: [
      'Strabismus', 'Amblyopia', 'Vergence Dysfunction',
      'Accommodative Disorders', 'Vision Therapy', 'Convergence Insufficiency',
      'Stereopsis', 'Fusion Disorders'
    ]
  },
  {
    id: 'optics',
    name: 'Optics',
    description: 'Physical and geometrical optics principles',
    topics: [
      'Refractive Errors', 'Lens Design', 'Aberrations',
      'Prismatic Effects', 'Optical Instruments', 'Wavefront Technology',
      'Vergence and Accommodation', 'Lens Coatings'
    ]
  },
  {
    id: 'clinical-procedures',
    name: 'Clinical Procedures',
    description: 'Examination techniques and diagnostic procedures',
    topics: [
      'Refraction', 'Slit Lamp Examination', 'Visual Field Testing',
      'Color Vision Testing', 'Keratometry', 'Tonometry',
      'Ophthalmoscopy', 'Binocular Vision Assessment'
    ]
  },
  {
    id: 'pharmacology',
    name: 'Ocular Pharmacology',
    description: 'Medications used in eye care and their effects',
    topics: [
      'Anti-glaucoma Drugs', 'Mydriatics and Cycloplegics', 'Ocular Lubricants',
      'Antihistamines', 'Anti-infective Agents', 'Anti-inflammatory Drugs',
      'Diagnostic Dyes', 'Topical Anesthetics'
    ]
  },
  {
    id: 'pediatrics',
    name: 'Pediatric Optometry',
    description: 'Eye care for infants and children',
    topics: [
      'Pediatric Eye Exam', 'Developmental Vision', 'Pediatric Refractive Errors',
      'Learning-Related Vision Problems', 'Visual Perceptual Skills',
      'Pediatric Contact Lens', 'Vision Screening', 'Infantile Strabismus'
    ]
  }
];
