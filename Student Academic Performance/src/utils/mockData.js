// Initial Mock Dataset for EduPulse AI (105 students with realistic academic attributes and intentional data quality noise)

const firstNames = [
  "Aarav", "Ananya", "Rohan", "Priya", "Aditya", "Sneha", "Vikram", "Kavya", "Rahul", "Neha",
  "Siddharth", "Isha", "Arjun", "Diya", "Karan", "Pooja", "Varun", "Riya", "Aman", "Tanvi",
  "Manish", "Shruti", "Akash", "Divya", "Deepak", "Anushka", "Nikhil", "Simran", "Yash", "Meera",
  "Harsh", "Swati", "Abhishek", "Bhavna", "Kunal", "Shweta", "Gaurav", "Nisha", "Saurabh", "Payal",
  "Rishabh", "Preeti", "Kartik", "Sonam", "Alok", "Monika", "Tarun", "Kirti", "Mayank", "Shikha",
  "Vivek", "Komal", "Dev", "Jyoti", "Rajesh", "Kiran", "Amit", "Sapna", "Sanjay", "Ritu",
  "Vijay", "Anita", "Rakesh", "Suman", "Pankaj", "Sunita", "Sunil", "Geeta", "Vinod", "Usha",
  "Mahesh", "Rekha", "Dinesh", "Radha", "Suresh", "Seema", "Ramesh", "Aarti", "Ashok", "Sarla",
  "Manoj", "Lata", "Satish", "Pushpa", "Anil", "Savitri", "Kamal", "Sharda", "Jitendra", "Sudha",
  "Narendra", "Durga", "Rajendra", "Gayatri", "Dharmendra", "Parvati", "Surendra", "Santosh", "Ravindra", "Maya",
  "Gajendra", "Vimala", "Upendra", "Shanti", "Bhupendra"
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Patel", "Singh", "Kumar", "Joshi", "Mehta", "Shah", "Reddy",
  "Rao", "Nair", "Iyer", "Chopra", "Malhotra", "Kapoor", "Bhasin", "Saxena", "Bhatia", "Agarwal",
  "Bansal", "Goel", "Garg", "Jain", "Trivedi", "Pandey", "Mishra", "Tripathi", "Shukla", "Tiwari"
];

const departments = [
  { dept: "CSE", courses: ["B.Tech Computer Science", "B.Tech AI & Data Science", "B.Tech Cybersecurity"] },
  { dept: "ECE", courses: ["B.Tech Electronics & Comm", "B.Tech VLSI Design"] },
  { dept: "EEE", courses: ["B.Tech Electrical & Electronics", "B.Tech Power Systems"] },
  { dept: "MECH", courses: ["B.Tech Mechanical Engg", "B.Tech Mechatronics"] },
  { dept: "CIVIL", courses: ["B.Tech Civil Engg", "B.Tech Structural Engg"] }
];

export const generateMockDataset = () => {
  const dataset = [];

  for (let i = 1; i <= 100; i++) {
    const id = `STU2025${String(i).padStart(3, '0')}`;
    const fn = firstNames[(i - 1) % firstNames.length];
    const ln = lastNames[(i * 7) % lastNames.length];
    const name = `${fn} ${ln}`;
    const gender = (i % 2 === 0) ? "Female" : "Male";
    const age = 19 + (i % 4);
    const deptObj = departments[(i % departments.length)];
    const dept = deptObj.dept;
    const course = deptObj.courses[i % deptObj.courses.length];
    const semester = (i % 6) + 1; // 1 to 6

    // Archetype assignment for realistic correlations
    // 0: High Performer, 1: Average Consistent, 2: Attendance Risk, 3: Assignment Risk, 4: Improving, 5: Declining
    const archetype = i % 6;

    let attendance, internalMarks, assignmentScore, extracurricular, prevMarks, currMarks;

    if (archetype === 0) { // High Performer
      attendance = 88 + (i % 12);
      internalMarks = 82 + (i % 17);
      assignmentScore = 85 + (i % 15);
      extracurricular = 70 + (i % 30);
      prevMarks = 84 + (i % 14);
      currMarks = 86 + (i % 13);
    } else if (archetype === 1) { // Average Consistent
      attendance = 75 + (i % 15);
      internalMarks = 65 + (i % 15);
      assignmentScore = 70 + (i % 15);
      extracurricular = 50 + (i % 30);
      prevMarks = 68 + (i % 12);
      currMarks = 70 + (i % 12);
    } else if (archetype === 2) { // Attendance Risk
      attendance = 45 + (i % 20); // Low attendance (45-64%)
      internalMarks = 42 + (i % 20);
      assignmentScore = 55 + (i % 25);
      extracurricular = 30 + (i % 30);
      prevMarks = 62 + (i % 15);
      currMarks = 48 + (i % 15);
    } else if (archetype === 3) { // Assignment Risk
      attendance = 80 + (i % 15);
      internalMarks = 58 + (i % 15);
      assignmentScore = 35 + (i % 20); // Low assignment score
      extracurricular = 40 + (i % 30);
      prevMarks = 65 + (i % 15);
      currMarks = 56 + (i % 15);
    } else if (archetype === 4) { // Improving
      attendance = 78 + (i % 15);
      internalMarks = 72 + (i % 15);
      assignmentScore = 75 + (i % 15);
      extracurricular = 60 + (i % 30);
      prevMarks = 55 + (i % 10);
      currMarks = 74 + (i % 12); // Higher than prev
    } else { // Declining
      attendance = 60 + (i % 15);
      internalMarks = 50 + (i % 15);
      assignmentScore = 58 + (i % 15);
      extracurricular = 45 + (i % 30);
      prevMarks = 78 + (i % 12);
      currMarks = 52 + (i % 12); // Lower than prev
    }

    dataset.push({
      Student_ID: id,
      Student_Name: name,
      Gender: gender,
      Age: age,
      Department: dept,
      Course: course,
      Semester: semester,
      Attendance: Math.round(attendance),
      Internal_Marks: Math.round(internalMarks),
      Assignment_Score: Math.round(assignmentScore),
      Extracurricular_Participation: Math.round(extracurricular),
      Previous_Semester_Marks: Math.round(prevMarks),
      Current_Semester_Marks: Math.round(currMarks)
    });
  }

  // Inject intentional data quality defects for demonstration
  // Missing records
  dataset[7].Attendance = null;
  dataset[14].Internal_Marks = null;
  dataset[23].Assignment_Score = null;
  dataset[31].Previous_Semester_Marks = null;
  dataset[42].Attendance = "";

  // Invalid values (out of bounds)
  dataset[12].Attendance = 125; // Impossible attendance
  dataset[28].Internal_Marks = -10; // Negative mark

  // Duplicate records
  const duplicate1 = { ...dataset[3] };
  const duplicate2 = { ...dataset[19] };
  dataset.push(duplicate1);
  dataset.push(duplicate2);

  return dataset;
};

export const INITIAL_DATASET = generateMockDataset();
