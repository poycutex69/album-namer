export function sanitizeFilename(filename: string): string {
    // Define patterns that are common 'junk' in your filenames
    const noisePatterns = [
      /YTMP3GG/gi,
      /YouTube/gi,
      /Media/gi,
      /HGH-\w+/gi, // Matches patterns like HGH-4jQZRcc
      /_\d+k/gi,   // Matches _128k, _320k, etc.
      /[_-]/g      // Replace underscores/dashes with spaces for better matching
    ];
  
    let clean = filename;
    noisePatterns.forEach(pattern => {
      clean = clean.replace(pattern, ' ');
    });
  
    return clean.toLowerCase().trim();
}

export function normalize(str: string): string {
    // Convert to lowercase, keep words inside parentheses,
    // replace punctuation with spaces, and collapse multiple spaces.
    return str
      .toLowerCase()
      .replace(/[()]/g, ' ') // Keep content, drop parens
      .replace(/[^a-z0-9\s]/g, ' ') // Remove non-alphanumeric chars
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }
  
  export function findBestMatch(filename: string, songList: string[]): string | null {
    const cleanFilename = sanitizeFilename(filename);
    const normFilename = normalize(cleanFilename);
    const filenameWords = normFilename.split(' ');

    let bestMatch: string | null = null;
    let highestScore = -1;

    songList.forEach(title => {
        const normTitle = normalize(title);
        const titleWords = normTitle.split(' ').filter(w => w.length > 0);
        
        // Count how many words from the TITLE are found in the FILENAME
        const matchingWords = titleWords.filter(word => 
            filenameWords.includes(word) 
        );

        // Calculate score: 
        // We want the most specific match to win.
        // Score = (number of matching words) / (total words in the title)
        // We also add a small bonus for the total length to prioritize specific tracks like "Reprise"
        const score = matchingWords.length + (titleWords.length * 0.1);

        // STRIKE RULE: If the title is "Reprise" but the filename isn't, or vice-versa, kill the score
        const titleIsReprise = normTitle.includes('reprise');
        const fileIsReprise = normFilename.includes('reprise');
        
        if (titleIsReprise !== fileIsReprise) {
            return; // Skip this song entirely for this file
        }

        // Only count it as a match if a significant portion of words match
        const matchPercentage = matchingWords.length / titleWords.length;
        
        if (matchPercentage >= 0.7 && score > highestScore) {
            highestScore = score;
            bestMatch = title;
        }
    });

    return bestMatch;
}