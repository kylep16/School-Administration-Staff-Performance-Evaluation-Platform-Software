// ─── EduPulse Seed Data ───────────────────────────────────────────────────────
export const SEED_TEACHERS = [
  {
    id: 1, name: 'Ms. Elena Vasquez', subject: 'Mathematics',
    email: 'e.vasquez@school.edu', avatar: 'EV',
    classes: [
      {
        id: 101, name: 'Algebra I', period: '1st', benchmark: 75,
        students: [
          { id: 1001, name: 'Jordan Lee',    grade: 9,  scores: [72,68,75,80,77], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1002, name: 'Priya Sharma',  grade: 9,  scores: [91,88,94,90,96], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1003, name: 'Marcus Webb',   grade: 9,  scores: [55,60,58,65,62], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1004, name: 'Aisha Okonkwo', grade: 9,  scores: [83,87,89,85,91], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1005, name: 'Tyler Nguyen',  grade: 9,  scores: [45,50,48,55,52], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1006, name: 'Sofia Reyes',   grade: 9,  scores: [78,80,76,82,79], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1051, name: 'Zoe Allen',     grade: 9,  scores: [62,65,60,68,64], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1052, name: 'Caleb Turner',  grade: 9,  scores: [88,91,85,93,89], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1053, name: 'Naomi Brooks',  grade: 9,  scores: [74,77,71,79,76], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1054, name: 'Derek Hughes',  grade: 9,  scores: [48,52,46,56,50], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1055, name: 'Lily Morris',   grade: 9,  scores: [92,95,90,96,93], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1056, name: 'Shane Bell',    grade: 9,  scores: [69,72,66,74,70], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1057, name: 'Keisha Powell', grade: 9,  scores: [81,84,78,86,82], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1058, name: 'Anton Ward',    grade: 9,  scores: [57,61,55,63,59], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1059, name: 'Harper Ross',   grade: 9,  scores: [76,79,73,81,77], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1060, name: 'Dante Fisher',  grade: 9,  scores: [84,87,81,89,85], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1061, name: 'Stella Cox',    grade: 9,  scores: [66,70,63,72,67], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1062, name: 'Finn Edwards',  grade: 9,  scores: [90,93,87,95,91], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1063, name: 'Aaliyah James', grade: 9,  scores: [71,74,68,76,72], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1064, name: 'Oscar White',   grade: 9,  scores: [53,57,51,59,55], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1065, name: 'Ruby Hall',     grade: 9,  scores: [87,90,84,92,88], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1066, name: 'Jasper Young',  grade: 9,  scores: [78,81,75,83,79], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1067, name: 'Nova King',     grade: 9,  scores: [61,64,58,66,62], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1068, name: 'Caden Scott',   grade: 9,  scores: [95,97,93,98,96], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1069, name: 'Iris Green',    grade: 9,  scores: [73,76,70,78,74], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1070, name: 'Leo Adams',     grade: 9,  scores: [44,48,42,52,46], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1071, name: 'Maya Baker',    grade: 9,  scores: [82,85,79,87,83], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1072, name: 'Jaxon Carter',  grade: 9,  scores: [67,70,64,72,68], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1073, name: 'Violet Nelson', grade: 9,  scores: [89,92,86,94,90], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1074, name: 'Cruz Mitchell', grade: 9,  scores: [75,78,72,80,76], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1075, name: 'Emery Perez',   grade: 9,  scores: [59,63,57,65,61], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1076, name: 'Flynn Roberts', grade: 9,  scores: [86,89,83,91,87], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
        ],
      },
      {
        id: 102, name: 'Geometry', period: '2nd', benchmark: 70,
        students: [
          { id: 1007, name: 'Devon Park',    grade: 10, scores: [88,90,85,92,87], topics: ['Triangles','Circles','Area','Volume','Proofs'] },
          { id: 1008, name: 'Chloe Martin',  grade: 10, scores: [62,58,65,70,67], topics: ['Triangles','Circles','Area','Volume','Proofs'] },
          { id: 1009, name: 'Elijah Torres', grade: 10, scores: [95,98,96,94,99], topics: ['Triangles','Circles','Area','Volume','Proofs'] },
          { id: 1010, name: 'Zara Johnson',  grade: 10, scores: [71,74,69,77,72], topics: ['Triangles','Circles','Area','Volume','Proofs'] },
          { id: 1011, name: 'Luca Romano',   grade: 10, scores: [50,55,48,60,53], topics: ['Triangles','Circles','Area','Volume','Proofs'] },
        ],
      },
      {
        id: 103, name: 'Algebra II', period: '3rd', benchmark: 80,
        students: [
          { id: 1012, name: 'Mia Chen',        grade: 10, scores: [85,82,88,91,87], topics: ['Functions','Quadratics','Exponentials','Logs','Sequences'] },
          { id: 1013, name: 'Noah Williams',   grade: 10, scores: [60,65,62,68,63], topics: ['Functions','Quadratics','Exponentials','Logs','Sequences'] },
          { id: 1014, name: 'Isabella Davis',  grade: 10, scores: [92,95,90,96,93], topics: ['Functions','Quadratics','Exponentials','Logs','Sequences'] },
        ],
      },
      {
        id: 104, name: 'Pre-Calculus', period: '4th', benchmark: 78,
        students: [
          { id: 1015, name: 'Ethan Kim',    grade: 11, scores: [77,74,79,81,76], topics: ['Trig','Vectors','Complex Nums','Polar','Limits'] },
          { id: 1016, name: 'Ava Brown',    grade: 11, scores: [65,68,63,70,67], topics: ['Trig','Vectors','Complex Nums','Polar','Limits'] },
          { id: 1017, name: 'James Wilson', grade: 11, scores: [88,91,86,93,89], topics: ['Trig','Vectors','Complex Nums','Polar','Limits'] },
          { id: 1018, name: 'Luna Garcia',  grade: 11, scores: [72,75,70,78,73], topics: ['Trig','Vectors','Complex Nums','Polar','Limits'] },
        ],
      },
      {
        id: 105, name: 'Statistics', period: '5th', benchmark: 72,
        students: [
          { id: 1019, name: 'Ryan Thompson',  grade: 12, scores: [80,84,78,86,82], topics: ['Probability','Distributions','Hypothesis','Regression','ANOVA'] },
          { id: 1020, name: 'Emma Rodriguez', grade: 12, scores: [58,62,55,65,60], topics: ['Probability','Distributions','Hypothesis','Regression','ANOVA'] },
          { id: 1021, name: 'Oliver Smith',   grade: 12, scores: [93,96,91,97,94], topics: ['Probability','Distributions','Hypothesis','Regression','ANOVA'] },
          { id: 1022, name: 'Aria Patel',     grade: 12, scores: [74,77,71,79,75], topics: ['Probability','Distributions','Hypothesis','Regression','ANOVA'] },
        ],
      },
    ],
    goals: [
      { id: 1, title: 'Raise Algebra I avg to 80%',          target: 80, current: 70, due: 'June 2025', created: 'Jan 2025' },
      { id: 2, title: 'Zero students below 55% by semester', target: 0,  current: 2,  due: 'May 2025',  created: 'Feb 2025' },
    ],
  },
  {
    id: 2, name: 'Mr. David Kim', subject: 'English',
    email: 'd.kim@school.edu', avatar: 'DK',
    classes: [
      {
        id: 201, name: 'English 9', period: '1st', benchmark: 75,
        students: [
          { id: 2001, name: 'Samira Blake', grade: 9,  scores: [82,85,79,88,83], topics: ['Essays','Grammar','Poetry','Reading','Vocab'] },
          { id: 2002, name: 'Carlos Reyes', grade: 9,  scores: [68,72,65,75,70], topics: ['Essays','Grammar','Poetry','Reading','Vocab'] },
          { id: 2003, name: 'Mei Zhang',    grade: 9,  scores: [91,94,89,96,92], topics: ['Essays','Grammar','Poetry','Reading','Vocab'] },
        ],
      },
      {
        id: 202, name: 'English 10', period: '2nd', benchmark: 70,
        students: [
          { id: 2004, name: 'Finn Murphy',  grade: 10, scores: [77,80,74,83,78], topics: ['Lit Analysis','Research','Speech','Argument','Syntax'] },
          { id: 2005, name: 'Layla Hassan', grade: 10, scores: [55,58,52,62,57], topics: ['Lit Analysis','Research','Speech','Argument','Syntax'] },
        ],
      },
      {
        id: 203, name: 'AP Language', period: '3rd', benchmark: 82,
        students: [
          { id: 2006, name: 'Xavier Bell', grade: 11, scores: [88,92,86,94,90], topics: ['Rhetoric','Synthesis','Argument','Style','Evidence'] },
          { id: 2007, name: 'Nora Walsh',  grade: 11, scores: [95,97,93,98,96], topics: ['Rhetoric','Synthesis','Argument','Style','Evidence'] },
          { id: 2008, name: 'Damien Cruz', grade: 11, scores: [72,75,69,78,73], topics: ['Rhetoric','Synthesis','Argument','Style','Evidence'] },
        ],
      },
    ],
    goals: [
      { id: 3, title: 'Improve essay scores 10pts', target: 85, current: 75, due: 'May 2025', created: 'Jan 2025' },
    ],
  },
  {
    id: 3, name: 'Dr. Priya Patel', subject: 'Science',
    email: 'p.patel@school.edu', avatar: 'PP',
    classes: [
      {
        id: 301, name: 'Biology', period: '1st', benchmark: 80,
        students: [
          { id: 3001, name: 'Cole Harrison', grade: 9,  scores: [88,91,85,93,89], topics: ['Cell Bio','Genetics','Evolution','Ecology','Human Body'] },
          { id: 3002, name: 'Jade Foster',   grade: 9,  scores: [62,66,59,70,64], topics: ['Cell Bio','Genetics','Evolution','Ecology','Human Body'] },
          { id: 3003, name: 'Miles Cooper',  grade: 9,  scores: [77,80,74,83,78], topics: ['Cell Bio','Genetics','Evolution','Ecology','Human Body'] },
          { id: 3004, name: 'Sierra Hayes',  grade: 9,  scores: [94,97,92,98,95], topics: ['Cell Bio','Genetics','Evolution','Ecology','Human Body'] },
        ],
      },
      {
        id: 302, name: 'Chemistry', period: '2nd', benchmark: 75,
        students: [
          { id: 3005, name: 'Blake Rivera',  grade: 10, scores: [70,73,67,76,71], topics: ['Atomic Structure','Bonding','Reactions','Stoich','Thermo'] },
          { id: 3006, name: 'Hana Yamamoto', grade: 10, scores: [85,88,82,91,86], topics: ['Atomic Structure','Bonding','Reactions','Stoich','Thermo'] },
        ],
      },
      {
        id: 303, name: 'AP Biology', period: '3rd', benchmark: 85,
        students: [
          { id: 3007, name: 'Felix Stone',   grade: 11, scores: [91,94,88,96,92], topics: ['Biochem','Genetics','Evolution','Physiology','Ecology'] },
          { id: 3008, name: 'Rosa Mitchell', grade: 11, scores: [83,87,80,90,85], topics: ['Biochem','Genetics','Evolution','Physiology','Ecology'] },
          { id: 3009, name: 'Anton Pierce',  grade: 11, scores: [76,79,73,82,77], topics: ['Biochem','Genetics','Evolution','Physiology','Ecology'] },
        ],
      },
    ],
    goals: [
      { id: 4, title: 'All Biology students above benchmark', target: 80, current: 65, due: 'June 2025', created: 'Jan 2025' },
    ],
  },
]
