// Test code for scheduling algorithm
async function testSchedulingAlgorithm() {
  try {
    // Event to be scheduled
    const eventToSchedule = {
      id: "EVT125",
      title: "Auto-scheduled Test Event",
      description: "Testing the scheduling algorithm",
      moduleId: "CIR210",
      student_count: 20,
      duration_minutes: 60 // Should match an available timeslot
    };
    
    console.log("Testing scheduling algorithm with event:", eventToSchedule);
    
    const scheduleResponse = await fetch('http://localhost:5000/api/scheduler/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventToSchedule)
    });
    
    if (!scheduleResponse.ok) {
      throw new Error(`Failed to schedule event: ${scheduleResponse.status}`);
    }
    
    const scheduleResult = await scheduleResponse.json();
    console.log("Scheduling result:", scheduleResult);
    
    // Verify the scheduled event has the correct structure
    console.assert(scheduleResult.success, "Scheduling should be successful");
    console.assert(scheduleResult.event.event_date, "Scheduled event should have a date");
    console.assert(scheduleResult.event.timeslot_id, "Scheduled event should have a timeslot ID");
    
    return {
      success: true,
      message: "Scheduling algorithm works correctly",
      scheduleResult
    };
  } catch (error) {
    console.error("Test failed:", error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Test code for event creation with new structure
async function testEventCreation() {
  try {
    // Step 1: Create an event with the new structure
    const eventData = {
      id: "EVT129",
      title: "Test Event with New Structure",
      description: "Testing the new date + timeslot structure",
      event_date: "2025-04-15", // Just the date, no time
      timeslot_id: "TS1", // Using an existing timeslot ID from your DB
      moduleId: "CIR210", // Use an existing module ID
      roomId: "LAB1", // Use an existing room ID
      staffId: "PROF1", // Use an existing staff ID
      student_count: 15,
      tag: "CLASS"
    };
    
    console.log("Creating test event with data:", eventData);
    
    const createResponse = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create event: ${createResponse.status}`);
    }
    
    const createdEvent = await createResponse.json();
    console.log("Created event:", createdEvent);
    
    // Step 2: Retrieve the created event
    const getResponse = await fetch(`http://localhost:5000/api/events/${createdEvent.id}`);
    
    if (!getResponse.ok) {
      throw new Error(`Failed to retrieve event: ${getResponse.status}`);
    }
    
    const retrievedEvent = await getResponse.json();
    console.log("Retrieved event:", retrievedEvent);
    
    // Step 3: Verify the structure is correct
    console.assert(retrievedEvent.eventDate === eventData.event_date, 
      "Event date doesn't match: " + retrievedEvent.eventDate + " vs " + eventData.event_date);
    
    console.assert(retrievedEvent.timeslotId === eventData.timeslot_id,
      "Timeslot ID doesn't match: " + retrievedEvent.timeslotId + " vs " + eventData.timeslot_id);
    
    return {
      success: true,
      message: "Event creation and retrieval successful",
      createdEvent
    };
  } catch (error) {
    console.error("Test failed:", error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Test code for constraint checking
async function testConstraintChecking() {
  try {
    // Step 1: Create an initial event
    const event1Data = {
      id: "EVT1232",
      title: "First Test Event",
      description: "Testing constraint checking",
      event_date: "2025-04-16",
      timeslot_id: "TS1", // Use an existing timeslot
      moduleId: "CAL101", 
      roomId: "LAB1",
      staffId: "LEC2",
      student_count: 15,
      tag: "CLASS"
    };
    
    console.log("Creating first test event for constraint checking:", event1Data);
    
    const createResponse1 = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event1Data)
    });
    
    if (!createResponse1.ok) {
      throw new Error(`Failed to create first event: ${createResponse1.status}`);
    }
    
    const createdEvent1 = await createResponse1.json();
    console.log("Created first event:", createdEvent1);
    
    // Step 2: Try to create a conflicting event (same room, same date, same timeslot)
    const event2Data = {
      id: "EVT1242",
      title: "Conflicting Test Event",
      description: "Should trigger a room conflict",
      event_date: event1Data.event_date,
      timeslot_id: event1Data.timeslot_id,
      moduleId: "CIR210", // Different module
      roomId: event1Data.roomId, // Same room to create conflict
      staffId: "LEC1", // Different staff
      student_count: 10,
      tag: "CLASS"
    };
    
    console.log("Checking constraints for conflicting event:", event2Data);
    
    const constraintResponse = await fetch('http://localhost:5000/api/constraints/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event2Data)
    });
    
    if (!constraintResponse.ok) {
      throw new Error(`Failed to check constraints: ${constraintResponse.status}`);
    }
    
    const constraintResults = await constraintResponse.json();
    console.log("Constraint check results:", constraintResults);
    
    // Step 3: Verify that a room conflict was detected
    console.assert(constraintResults.hardViolations.some(v => v.constraintId === 'room-conflict'),
      "Room conflict not detected when it should have been");
    
    return {
      success: true,
      message: "Constraint checking works correctly",
      constraintResults
    };
  } catch (error) {
    console.error("Test failed:", error);
    return {
      success: false,
      message: error.message
    };
  }
}

async function runBackendTests() {
    console.log("=== STARTING BACKEND TESTS ===");
    
    console.log("\n1. Testing Event Creation and Retrieval");
    const eventCreationResult = await testEventCreation();
    console.log("Result:", eventCreationResult.success ? "✅ PASSED" : "❌ FAILED");
    console.log(eventCreationResult.message);
    
    console.log("\n2. Testing Constraint Checking");
    const constraintResult = await testConstraintChecking();
    console.log("Result:", constraintResult.success ? "✅ PASSED" : "❌ FAILED");
    console.log(constraintResult.message);
    
    console.log("\n3. Testing Scheduling Algorithm");
    const schedulingResult = await testSchedulingAlgorithm();
    console.log("Result:", schedulingResult.success ? "✅ PASSED" : "❌ FAILED");
    console.log(schedulingResult.message);
    
    console.log("\n=== BACKEND TESTS COMPLETED ===");
  }
  
  runBackendTests();