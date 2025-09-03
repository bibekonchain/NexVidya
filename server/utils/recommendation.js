// Normalize lecture titles
export function cleanSkills(skills) {
  return skills.map((skill) =>
    skill.toLowerCase().trim().replace(/['"]+/g, "")
  );
}

// Basic cosine similarity
export function cosineSimilarity(courseSkills, userSkills) {
  const normalizedCourseSkills = cleanSkills(courseSkills);
  const normalizedUserSkills = cleanSkills(userSkills);

  const matchCount = normalizedCourseSkills.filter((skill) =>
    normalizedUserSkills.includes(skill)
  ).length;

  const totalSkills = new Set([
    ...normalizedCourseSkills,
    ...normalizedUserSkills,
  ]).size;

  return (matchCount / totalSkills) * 100;
}
