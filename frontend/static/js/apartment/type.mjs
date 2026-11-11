export const ApartmentType = {
    Studio: 0,
    OneRoom: 1,
    TwoRoom: 2,
    ThreeRoom: 3,
    FourRoom: 4,
};


export const APARTMENT_TYPE_LABELS = {
    [ApartmentType.Studio]: 'Студия',
    [ApartmentType.OneRoom]: '1-комн.',
    [ApartmentType.TwoRoom]: '2-комн.',
    [ApartmentType.ThreeRoom]: '3-комн.',
    [ApartmentType.FourRoom]: '4-комн.',
};


export const APARTMENT_TYPES = Object.values(ApartmentType);


export function apartmentTypeLabel(type) {
    return APARTMENT_TYPE_LABELS[type] ?? '';
}
