// Sample scholars data for Nueva Ecija universities

const UNIVERSITIES = [
  'Nueva Ecija University of Science and Technology (NEUST)',
  'Central Luzon State University (CLSU)',
  'Wesleyan University - Philippines (WUP)',
  'Pampanga State Agricultural University (PSAU) - Nueva Ecija Campus',
  'Philippine Normal University (PNU) - Nueva Ecija Extension'
]

const BARANGAYS = [
  'Atate', 'Caballero', 'Caimito', 'Ganaderia', 'Langka',
  'Mapangpang', 'Marcos Village', 'Malabo', 'Popolon', 'Singalat', 'Poblacion'
]

const COURSES = [
  'BS Computer Science',
  'BS Information Technology',
  'BS Business Administration',
  'BS Accountancy',
  'BS Civil Engineering',
  'BS Electrical Engineering',
  'BS Agriculture',
  'BS Education',
  'BS Nursing',
  'BS Psychology',
  'BS Biology',
  'AB Communication',
  'BS Criminology',
  'BS Architecture'
]

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const SEMESTERS = ['1st Sem', '2nd Sem']

const FILIPINO_NAMES = [
  { firstName: 'Maria', lastName: 'Santos', middleName: 'Cruz' },
  { firstName: 'Juan', lastName: 'Dela Cruz', middleName: 'Reyes' },
  { firstName: 'Ana', lastName: 'Garcia', middleName: 'Lopez' },
  { firstName: 'Jose', lastName: 'Mendoza', middleName: 'Torres' },
  { firstName: 'Rosa', lastName: 'Ramos', middleName: 'Silva' },
  { firstName: 'Pedro', lastName: 'Castro', middleName: 'Rivera' },
  { firstName: 'Carmen', lastName: 'Fernandez', middleName: 'Morales' },
  { firstName: 'Miguel', lastName: 'Gonzales', middleName: 'Diaz' },
  { firstName: 'Luz', lastName: 'Martinez', middleName: 'Valdez' },
  { firstName: 'Carlos', lastName: 'Rodriguez', middleName: 'Bautista' },
  { firstName: 'Elena', lastName: 'Hernandez', middleName: 'Santos' },
  { firstName: 'Roberto', lastName: 'Perez', middleName: 'Cruz' },
  { firstName: 'Josefa', lastName: 'Sanchez', middleName: 'Reyes' },
  { firstName: 'Antonio', lastName: 'Torres', middleName: 'Garcia' },
  { firstName: 'Teresa', lastName: 'Flores', middleName: 'Lopez' },
  { firstName: 'Francisco', lastName: 'Rivera', middleName: 'Mendoza' },
  { firstName: 'Isabel', lastName: 'Gomez', middleName: 'Ramos' },
  { firstName: 'Manuel', lastName: 'Diaz', middleName: 'Castro' },
  { firstName: 'Patricia', lastName: 'Morales', middleName: 'Fernandez' },
  { firstName: 'Ricardo', lastName: 'Jimenez', middleName: 'Gonzales' },
  { firstName: 'Sandra', lastName: 'Ruiz', middleName: 'Martinez' },
  { firstName: 'Fernando', lastName: 'Alvarez', middleName: 'Rodriguez' },
  { firstName: 'Gloria', lastName: 'Romero', middleName: 'Hernandez' },
  { firstName: 'Alfredo', lastName: 'Navarro', middleName: 'Perez' },
  { firstName: 'Beatriz', lastName: 'Guzman', middleName: 'Sanchez' },
  { firstName: 'Leonardo', lastName: 'Villanueva', middleName: 'Santos' },
  { firstName: 'Sofia', lastName: 'De Leon', middleName: 'Cruz' },
  { firstName: 'Gabriel', lastName: 'Aquino', middleName: 'Reyes' },
  { firstName: 'Mariana', lastName: 'Bautista', middleName: 'Garcia' },
  { firstName: 'Diego', lastName: 'Magno', middleName: 'Torres' },
  { firstName: 'Catalina', lastName: 'Ocampo', middleName: 'Lopez' },
  { firstName: 'Rafael', lastName: 'Soriano', middleName: 'Silva' },
  { firstName: 'Angelica', lastName: 'Pascual', middleName: 'Mendoza' },
  { firstName: 'Rodrigo', lastName: 'Tolentino', middleName: 'Rivera' },
  { firstName: 'Veronica', lastName: 'Mercado', middleName: 'Castro' },
  { firstName: 'Domingo', lastName: 'Villaluz', middleName: 'Ramos' },
  { firstName: 'Rosario', lastName: 'Santiago', middleName: 'Fernandez' },
  { firstName: 'Alberto', lastName: 'Aguilar', middleName: 'Morales' },
  { firstName: 'Cristina', lastName: 'Valdez', middleName: 'Gonzales' },
  { firstName: 'Eduardo', lastName: 'Salazar', middleName: 'Diaz' },
  { firstName: 'Felicia', lastName: 'Miranda', middleName: 'Martinez' },
  { firstName: 'Gregorio', lastName: 'Padilla', middleName: 'Perez' },
  { firstName: 'Helena', lastName: 'Estrada', middleName: 'Sanchez' },
  { firstName: 'Ignacio', lastName: 'Velasco', middleName: 'Reyes' },
  { firstName: 'Juliana', lastName: 'Cortez', middleName: 'Garcia' },
  { firstName: 'Lorenzo', lastName: 'Zamora', middleName: 'Torres' },
  { firstName: 'Natalia', lastName: 'Ortega', middleName: 'Lopez' },
  { firstName: 'Oscar', lastName: 'Cabrera', middleName: 'Silva' },
  { firstName: 'Pilar', lastName: 'Fuentes', middleName: 'Mendoza' },
  { firstName: 'Ramiro', lastName: 'Gutierrez', middleName: 'Rivera' },
  { firstName: 'Sergio', lastName: 'Medina', middleName: 'Castro' },
  { firstName: 'Valentina', lastName: 'Nunez', middleName: 'Ramos' },
  { firstName: 'Xavier', lastName: 'Ponce', middleName: 'Fernandez' },
  { firstName: 'Yolanda', lastName: 'Rosales', middleName: 'Morales' },
  { firstName: 'Zachary', lastName: 'Salinas', middleName: 'Gonzales' },
  { firstName: 'Andrea', lastName: 'Vargas', middleName: 'Diaz' },
  { firstName: 'Benjamin', lastName: 'Cervantes', middleName: 'Martinez' },
  { firstName: 'Clara', lastName: 'Dominguez', middleName: 'Perez' },
  { firstName: 'Daniel', lastName: 'Espinosa', middleName: 'Sanchez' },
  { firstName: 'Emilia', lastName: 'Galvez', middleName: 'Reyes' },
  { firstName: 'Felipe', lastName: 'Herrera', middleName: 'Garcia' },
  { firstName: 'Gabriela', lastName: 'Ibarra', middleName: 'Torres' },
  { firstName: 'Hector', lastName: 'Juarez', middleName: 'Lopez' },
  { firstName: 'Irene', lastName: 'Lucero', middleName: 'Silva' },
  { firstName: 'Jorge', lastName: 'Maldonado', middleName: 'Mendoza' },
  { firstName: 'Karina', lastName: 'Navarro', middleName: 'Rivera' },
  { firstName: 'Luis', lastName: 'Oliva', middleName: 'Castro' },
  { firstName: 'Monica', lastName: 'Paredes', middleName: 'Ramos' },
  { firstName: 'Nestor', lastName: 'Quintana', middleName: 'Fernandez' },
  { firstName: 'Olivia', lastName: 'Robles', middleName: 'Morales' },
  { firstName: 'Pablo', lastName: 'Solis', middleName: 'Gonzales' },
  { firstName: 'Regina', lastName: 'Tapia', middleName: 'Diaz' },
  { firstName: 'Samuel', lastName: 'Urbina', middleName: 'Martinez' },
  { firstName: 'Tatiana', lastName: 'Vega', middleName: 'Perez' },
  { firstName: 'Ulysses', lastName: 'Zavala', middleName: 'Sanchez' }
]

// Generate random amount between 15000 and 50000
const getRandomAmount = () => {
  const amounts = [15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000]
  return amounts[Math.floor(Math.random() * amounts.length)]
}

// Generate scholars for all universities
export const generateSampleScholars = () => {
  const scholars = []
  let nameIndex = 0
  let baseTimestamp = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
  
  UNIVERSITIES.forEach((university, uniIndex) => {
    for (let i = 0; i < 15; i++) {
      const name = FILIPINO_NAMES[nameIndex % FILIPINO_NAMES.length]
      const scholar = {
        id: `${baseTimestamp + (uniIndex * 15 + i)}`,
        firstName: name.firstName,
        lastName: name.lastName,
        middleName: name.middleName,
        barangay: BARANGAYS[Math.floor(Math.random() * BARANGAYS.length)],
        school: university,
        yearLevel: YEAR_LEVELS[Math.floor(Math.random() * YEAR_LEVELS.length)],
        semester: SEMESTERS[Math.floor(Math.random() * SEMESTERS.length)],
        course: COURSES[Math.floor(Math.random() * COURSES.length)],
        amount: getRandomAmount(),
        status: Math.random() > 0.3 ? 'Processing' : 'Paid', // 70% Processing, 30% Paid
        contactNumber: `09${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@email.com`,
        schoolYear: '2026-2027',
        createdAt: new Date(baseTimestamp + (uniIndex * 15 + i) * 1000).toISOString()
      }
      scholars.push(scholar)
      nameIndex++
    }
  })
  
  return scholars
}

// Import function for the store
export const importSampleData = (scholarStore) => {
  const sampleScholars = generateSampleScholars()
  
  // Clear existing data first (optional)
  if (window.confirm(`This will add ${sampleScholars.length} sample scholars. Continue?`)) {
    sampleScholars.forEach(scholar => {
      scholarStore.getState().scholars.push(scholar)
    })
    
    // Trigger a state update
    scholarStore.setState({ scholars: [...scholarStore.getState().scholars] })
    
    return true
  }
  
  return false
}

export default generateSampleScholars
