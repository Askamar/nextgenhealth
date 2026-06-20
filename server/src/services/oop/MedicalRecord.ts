/**
 * MedicalRecord Models - OOP Inheritance Style
 * Demonstrates abstract classes, inheritance, and business logic validations.
 */

export abstract class MedicalDocument {
    public id: string;
    public patientId: string;
    public doctorName: string;
    public date: string;

    constructor(id: string, patientId: string, doctorName: string, date: string) {
        this.id = id;
        this.patientId = patientId;
        this.doctorName = doctorName;
        this.date = date;
    }

    // Abstract methods to be implemented by child classes
    public abstract getType(): string;
    public abstract validate(): boolean;
}

export interface PrescribedMedication {
    name: string;
    dose: string;
    frequency: string;
    timing: string;
}

export class EPrescription extends MedicalDocument {
    public appointmentId: string;
    public department: string;
    public medications: PrescribedMedication[];
    public notes: string;
    public safetyFlagged: boolean;

    constructor(
        id: string,
        patientId: string,
        doctorName: string,
        date: string,
        appointmentId: string,
        department: string,
        medications: PrescribedMedication[],
        notes: string = '',
        safetyFlagged: boolean = false
    ) {
        super(id, patientId, doctorName, date);
        this.appointmentId = appointmentId;
        this.department = department;
        this.medications = medications;
        this.notes = notes;
        this.safetyFlagged = safetyFlagged;
    }

    public getType(): string {
        return 'Prescription';
    }

    public validate(): boolean {
        // Validation: must have at least one medication and names must be valid strings
        return this.medications && this.medications.length > 0 && this.medications.every(m => m.name && m.name.trim() !== '');
    }

    /**
     * Checks if the prescribed drugs list has any interactions using array matching.
     */
    public checkSafetyInteractions(interactions: any[]): { isSafe: boolean; warning?: string } {
        const drugNames = this.medications.map(m => m.name.toLowerCase().trim());
        
        // Loop through interactions to find if any two prescribed drugs collide
        for (const inter of interactions) {
            try {
                // The interaction drugs are stored as a JSON string array in MySQL
                const forbiddenArray: string[] = JSON.parse(inter.drugs).map((d: string) => d.toLowerCase().trim());
                
                // Check if all forbidden drugs in this interaction are present in our prescribed list
                // e.g. if interaction is ["Aspirin", "Warfarin"], check if both are in our drugNames array
                const intersect = forbiddenArray.filter(fd => drugNames.includes(fd));
                if (intersect.length === forbiddenArray.length) {
                    return {
                        isSafe: false,
                        warning: `Warning (${inter.severity}): ${inter.description}. Management: ${inter.management || 'Use with caution.'}`
                    };
                }
            } catch (e) {
                // Ignore parse errors on seed database items
            }
        }

        return { isSafe: true };
    }
}

export class LabReport extends MedicalDocument {
    public testName: string;
    public testResult: string;
    public labName: string;

    constructor(
        id: string,
        patientId: string,
        doctorName: string,
        date: string,
        testName: string,
        testResult: string,
        labName: string
    ) {
        super(id, patientId, doctorName, date);
        this.testName = testName;
        this.testResult = testResult;
        this.labName = labName;
    }

    public getType(): string {
        return 'LabReport';
    }

    public validate(): boolean {
        return !!this.testName && this.testName.trim() !== '' && !!this.testResult && this.testResult.trim() !== '';
    }
}
