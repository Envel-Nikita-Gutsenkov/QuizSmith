import { db, auth } from './firebaseConfig'; // Ensure auth is imported if needed for user checks
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import type { PageTemplate } from './types'; // Assuming PageTemplate is defined in types.ts

const TEMPLATES_COLLECTION = 'pageTemplates';

// Type for new template data, omitting id (Firestore generates it)
export type NewPageTemplateData = Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'> & {
  userId?: string; // Optional: associate with a user
};

// Type for template update data, id is required, other fields optional
export type UpdatePageTemplateData = Partial<Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'>> & {
  // `updatedAt` will be set by serverTimestamp
};


// Add a new page template
export const addPageTemplate = async (templateData: NewPageTemplateData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), {
      ...templateData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding page template: ", error);
    throw new Error("Failed to add page template.");
  }
};

// Get a single page template by ID
export const getPageTemplate = async (id: string): Promise<PageTemplate | null> => {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // Combine doc data with id. Ensure createdAt/updatedAt are correctly handled if they are Timestamps.
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        // Convert Firestore Timestamps to ISO strings if necessary for consistency,
        // or handle them as Timestamps in your PageTemplate type.
        // This example assumes they might need conversion if your type expects strings.
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as PageTemplate;
    } else {
      console.log("No such page template found!");
      return null;
    }
  } catch (error) {
    console.error("Error getting page template: ", error);
    throw new Error("Failed to retrieve page template.");
  }
};

// Get all page templates
export const getAllPageTemplates = async (): Promise<PageTemplate[]> => {
  try {
    const templatesCollection = collection(db, TEMPLATES_COLLECTION);
    // Consider ordering, e.g., by name or creation date
    const q = query(templatesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as PageTemplate;
    });
  } catch (error) {
    console.error("Error getting all page templates: ", error);
    throw new Error("Failed to retrieve page templates.");
  }
};

// Update an existing page template
export const updatePageTemplate = async (id: string, templateData: UpdatePageTemplateData): Promise<void> => {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, id);
    await updateDoc(docRef, {
      ...templateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating page template: ", error);
    throw new Error("Failed to update page template.");
  }
};

// Delete a page template (use with caution)
export const deletePageTemplate = async (id: string): Promise<void> => {
  try {
    // Add check: only admin should be able to delete
    // This is a placeholder for where such a check might go if doing client-side role checks,
    // but primary enforcement should be via Firestore security rules.
    // const user = auth.currentUser;
    // if (!user || !user.getIdTokenResult().then(token => token.claims.admin)) { // Example admin check
    //   throw new Error("User not authorized to delete templates.");
    // }
    const docRef = doc(db, TEMPLATES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting page template: ", error);
    throw new Error("Failed to delete page template.");
  }
};
