export function foodRole(session){return session?.user?.role || (session?.user?.admin===true?'owner':'customer');}
export function canManageFood(session){return ['owner','manager'].includes(foodRole(session));}
export function canUseKitchen(session){return ['owner','manager','kitchen'].includes(foodRole(session));}
