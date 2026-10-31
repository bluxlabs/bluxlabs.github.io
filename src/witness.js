export const witnessLayers = [
  {
    id: 'frame', name: 'Witness Frame', label: 'The physical reference',
    summary: 'Mechanical structure, rails and a shared physical reference for the experiment.',
    detail: 'The modular frame positions the arena and recording hardware within one structure. Rail layout and mounting locations are configured around the experimental task.',
    image: '/assets/products/witness/frame.webp',
    alt: 'Model-rendered detail of the Witness frame, showing the vertical extrusion, cross rails and joining plate.',
    caption: 'Frame junction and mounting rails · Model render',
  },
  {
    id: 'arena', name: 'Witness Arena', label: 'The experimental space',
    summary: 'The defined experimental space, working region and effective observation volume.',
    detail: 'The arena defines where the experiment takes place. Its enclosure and relationship to the camera views are considered together when configuring an observation setup.',
    image: '/assets/products/witness/arena.webp',
    alt: 'Model-rendered view of the central glass arena and its position inside the surrounding Witness frame.',
    caption: 'Central arena within the frame · Model render',
  },
  {
    id: 'sense', name: 'Witness Sense', label: 'The acquisition layer',
    summary: 'Multi-camera views, the sensor network, synchronization and data acquisition.',
    detail: 'Sense brings together the recording viewpoints and acquisition hardware. Camera and sensor configuration, synchronization requirements and data collection are specified for each experiment.',
    image: '/assets/products/witness/sense.webp',
    alt: 'Model-rendered close-up of a Witness camera and its mounting assembly.',
    caption: 'Camera and mounting assembly · Model render',
  },
];
