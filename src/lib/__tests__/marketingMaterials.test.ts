// Test file to demonstrate usage of MarketingMaterialsService
// This is not meant to run automatically, just to show example usage

import { MarketingMaterialsService } from '../marketingMaterials'

// Example usage of the MarketingMaterialsService
export const exampleUsage = async () => {

  // 1. Create a new material
  const newMaterial = await MarketingMaterialsService.createMaterial({
    label: 'UC Flyer Template',
    url: 'https://drive.google.com/file/d/example123',
    event_id: 1,  // Associated with a specific event
    notes: 'Template for UC health fair flyers'
  })

  // 2. Create an "any time" material
  const anyTimeMaterial = await MarketingMaterialsService.createMaterial({
    label: 'General Brochure',
    url: 'https://drive.google.com/file/d/example456',
    event_id: null,  // NULL means "any time" material
    notes: 'General purpose brochure for any event'
  })

  // 3. Get all materials
  const allMaterials = await MarketingMaterialsService.getAllMaterials()
  console.log('All materials:', allMaterials)

  // 4. Associate material with an event
  if (newMaterial) {
    await MarketingMaterialsService.associateMaterialWithEvent(1, newMaterial.id)
  }

  // 5. Get materials for a specific event
  const eventMaterials = await MarketingMaterialsService.getEventMaterials(1)
  console.log('Materials for event 1:', eventMaterials)

  // 6. Get materials for a quarter
  const quarterMaterials = await MarketingMaterialsService.getMaterialsForQuarter(1, 2024)
  console.log('Q1 2024 materials:', quarterMaterials)

  // 7. Get any-time materials
  const generalMaterials = await MarketingMaterialsService.getAnyTimeMaterials()
  console.log('General materials:', generalMaterials)

  // 8. Update a material
  if (newMaterial) {
    const updated = await MarketingMaterialsService.updateMaterial(newMaterial.id, {
      label: 'Updated UC Flyer Template',
      url: 'https://drive.google.com/file/d/new-example123'
    })
    console.log('Updated material:', updated)
  }

  // 9. Search materials
  const searchResults = await MarketingMaterialsService.searchMaterials('flyer')
  console.log('Search results for "flyer":', searchResults)

  // 10. Set all materials for an event (replaces existing associations)
  if (newMaterial && anyTimeMaterial) {
    await MarketingMaterialsService.setEventMaterials(1, [newMaterial.id, anyTimeMaterial.id])
  }
}

// Example of how to use these functions in components:
/*

// In a React component:
import { MarketingMaterialsService } from '@/lib/marketingMaterials'

const EventMaterialsComponent = ({ eventId }: { eventId: number }) => {
  const [materials, setMaterials] = useState<MarketingMaterial[]>([])

  useEffect(() => {
    const loadMaterials = async () => {
      const eventMaterials = await MarketingMaterialsService.getEventMaterials(eventId)
      const anyTimeMaterials = await MarketingMaterialsService.getAnyTimeMaterials()
      setMaterials([...eventMaterials, ...anyTimeMaterials])
    }

    loadMaterials()
  }, [eventId])

  return (
    <div>
      <h3>Marketing Materials</h3>
      {materials.map(material => (
        <div key={material.id}>
          <a href={material.url} target="_blank" rel="noopener noreferrer">
            {material.label}
          </a>
          {material.is_any_time && <span> (General)</span>}
        </div>
      ))}
    </div>
  )
}

*/