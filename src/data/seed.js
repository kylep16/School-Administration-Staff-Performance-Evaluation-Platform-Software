// ─── EduPulse Seed Data ───────────────────────────────────────────────────────
// Edit this file to change the default teachers, classes, and students.

export const SEED_TEACHERS = [
  {
    id: 1,
    name: 'Ms. Elena Vasquez',
    subject: 'Mathematics',
    email: 'e.vasquez@school.edu',
    avatar: 'EV',
    classes: [
      {
        id: 101,
        name: 'Algebra I',
        period: '1st',
        benchmark: 75,
        students: [
          { id: 1001, name: 'Jordan Lee',     scores: [72, 68, 75, 80, 77], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1002, name: 'Priya Sharma',   scores: [91, 88, 94, 90, 96], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1003, name: 'Marcus Webb',    scores: [55, 60, 58, 65, 62], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1004, name: 'Aisha Okonkwo',  scores: [83, 87, 89, 85, 91], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1005, name: 'Tyler Nguyen',   scores: [45, 50, 48, 55, 52], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
          { id: 1006, name: 'Sofia Reyes',    scores: [78, 80, 76, 82, 79], topics: ['Linear Equations','Inequalities','Systems','Polynomials','Factoring'] },
        ],
      },
      {
        id: 102,
        name: 'Geometry',
        period: '2nd',
        benchmark: 70,
        students: [
          { id: 1007, name: 'Devon Park',     scores: [88, 90, 85, 92, 87], topics: ['Triangles','Circles','Area','Volume','Proofs'] },
          { id: 1008, name: 'Chloe Martin',   scores: [62, 58, 65, 70, 67], topics: ['Triangles','Circles','Area','Volume','Proofs'] },
          { id: 1009, name: 'Elijah Torres',  scores: [95, 98, 96, 94, 99], topics: ['Triangles','Circles','Area','Volume','Proofs'] },
          { id: 1010, name: 'Zara Johnson',   scores: [71, 74, 69, 77, 72], topics: ['Triangles','Circles','Area','Volume','Proofs'] },
          { id: 1011, name: 'Luca Romano',    scores: [50, 55, 48, 60, 53], topics: ['Triangles','Circles','Area','Volume','Proofs'] },
        ],
      },
      {
        id: 103,
        name: 'Algebra II',
        period: '3rd',
        benchmark: 80,
        students: [
          { id: 1012, name: 'Mia Chen',         scores: [85, 82, 88, 91, 87], topics: ['Functions','Quadratics','Exponentials','Logs','Sequences'] },
          { id: 1013, name: 'Noah Williams',     scores: [60, 65, 62, 68, 63], topics: ['Functions','Quadratics','Exponentials','Logs','Sequences'] },
          { id: 1014, name: 'Isabella Davis',    scores: [92, 95, 90, 96, 93], topics: ['Functions','Quadratics','Exponentials','Logs','Sequences'] },
        ],
      },
      {
        id: 104,
        name: 'Pre-Calculus',
        period: '4th',
        benchmark: 78,
        students: [
          { id: 1015, name: 'Ethan Kim',   scores: [77, 74, 79, 81, 76], topics: ['Trig','Vectors','Complex Nums','Polar','Limits'] },
          { id: 1016, name: 'Ava Brown',   scores: [65, 68, 63, 70, 67], topics: ['Trig','Vectors','Complex Nums','Polar','Limits'] },
          { id: 1017, name: 'James Wilson',scores: [88, 91, 86, 93, 89], topics: ['Trig','Vectors','Complex Nums','Polar','Limits'] },
          { id: 1018, name: 'Luna Garcia', scores: [72, 75, 70, 78, 73], topics: ['Trig','Vectors','Complex Nums','Polar','Limits'] },
        ],
      },
      {
        id: 105,
        name: 'Statistics',
        period: '5th',
        benchmark: 72,
        students: [
          { id: 1019, name: 'Ryan Thompson', scores: [80, 84, 78, 86, 82], topics: ['Probability','Distributions','Hypothesis','Regression','ANOVA'] },
          { id: 1020, name: 'Emma Rodriguez',scores: [58, 62, 55, 65, 60], topics: ['Probability','Distributions','Hypothesis','Regression','ANOVA'] },
          { id: 1021, name: 'Oliver Smith',  scores: [93, 96, 91, 97, 94], topics: ['Probability','Distributions','Hypothesis','Regression','ANOVA'] },
          { id: 1022, name: 'Aria Patel',    scores: [74, 77, 71, 79, 75], topics: ['Probability','Distributions','Hypothesis','Regression','ANOVA'] },
        ],
      },
    ],
    goals: [
      { id: 1, title: 'Raise Algebra I avg to 80%',         target: 80, current: 70, due: 'June 2025', created: 'Jan 2025' },
      { id: 2, title: 'Zero students below 55% by semester', target: 0,  current: 2,  due: 'May 2025',  created: 'Feb 2025' },
    ],
  },
  {
    id: 2,
    name: 'Mr. David Kim',
    subject: 'English',
    email: 'd.kim@school.edu',
    avatar: 'DK',
    classes: [
      {
        id: 201,
        name: 'English 9',
        period: '1st',
        benchmark: 75,
        students: [
          { id: 2001, name: 'Samira Blake', scores: [82, 85, 79, 88, 83], topics: ['Essays','Grammar','Poetry','Reading','Vocab'] },
          { id: 2002, name: 'Carlos Reyes', scores: [68, 72, 65, 75, 70], topics: ['Essays','Grammar','Poetry','Reading','Vocab'] },
          { id: 2003, name: 'Mei Zhang',    scores: [91, 94, 89, 96, 92], topics: ['Essays','Grammar','Poetry','Reading','Vocab'] },
        ],
      },
      {
        id: 202,
        name: 'English 10',
        period: '2nd',
        benchmark: 70,
        students: [
          { id: 2004, name: 'Finn Murphy',  scores: [77, 80, 74, 83, 78], topics: ['Lit Analysis','Research','Speech','Argument','Syntax'] },
          { id: 2005, name: 'Layla Hassan', scores: [55, 58, 52, 62, 57], topics: ['Lit Analysis','Research','Speech','Argument','Syntax'] },
        ],
      },
      {
        id: 203,
        name: 'AP Language',
        period: '3rd',
        benchmark: 82,
        students: [
          { id: 2006, name: 'Xavier Bell',  scores: [88, 92, 86, 94, 90], topics: ['Rhetoric','Synthesis','Argument','Style','Evidence'] },
          { id: 2007, name: 'Nora Walsh',   scores: [95, 97, 93, 98, 96], topics: ['Rhetoric','Synthesis','Argument','Style','Evidence'] },
          { id: 2008, name: 'Damien Cruz',  scores: [72, 75, 69, 78, 73], topics: ['Rhetoric','Synthesis','Argument','Style','Evidence'] },
        ],
      },
    ],
    goals: [
      { id: 3, title: 'Improve essay scores 10pts', target: 85, current: 75, due: 'May 2025', created: 'Jan 2025' },
    ],
  },
  {
    id: 3,
    name: 'Dr. Priya Patel',
    subject: 'Science',
    email: 'p.patel@school.edu',
    avatar: 'PP',
    classes: [
      {
        id: 301,
        name: 'Biology',
        period: '1st',
        benchmark: 80,
        students: [
          { id: 3001, name: 'Cole Harrison', scores: [88, 91, 85, 93, 89], topics: ['Cell Bio','Genetics','Evolution','Ecology','Human Body'] },
          { id: 3002, name: 'Jade Foster',   scores: [62, 66, 59, 70, 64], topics: ['Cell Bio','Genetics','Evolution','Ecology','Human Body'] },
          { id: 3003, name: 'Miles Cooper',  scores: [77, 80, 74, 83, 78], topics: ['Cell Bio','Genetics','Evolution','Ecology','Human Body'] },
          { id: 3004, name: 'Sierra Hayes',  scores: [94, 97, 92, 98, 95], topics: ['Cell Bio','Genetics','Evolution','Ecology','Human Body'] },
        ],
      },
      {
        id: 302,
        name: 'Chemistry',
        period: '2nd',
        benchmark: 75,
        students: [
          { id: 3005, name: 'Blake Rivera',    scores: [70, 73, 67, 76, 71], topics: ['Atomic Structure','Bonding','Reactions','Stoich','Thermo'] },
          { id: 3006, name: 'Hana Yamamoto',   scores: [85, 88, 82, 91, 86], topics: ['Atomic Structure','Bonding','Reactions','Stoich','Thermo'] },
        ],
      },
      {
        id: 303,
        name: 'AP Biology',
        period: '3rd',
        benchmark: 85,
        students: [
          { id: 3007, name: 'Felix Stone',  scores: [91, 94, 88, 96, 92], topics: ['Biochem','Genetics','Evolution','Physiology','Ecology'] },
          { id: 3008, name: 'Rosa Mitchell',scores: [83, 87, 80, 90, 85], topics: ['Biochem','Genetics','Evolution','Physiology','Ecology'] },
          { id: 3009, name: 'Anton Pierce', scores: [76, 79, 73, 82, 77], topics: ['Biochem','Genetics','Evolution','Physiology','Ecology'] },
        ],
      },
    ],
    goals: [
      { id: 4, title: 'All Biology students above benchmark', target: 80, current: 65, due: 'June 2025', created: 'Jan 2025' },
    ],
  },
]
