from rest_framework import permissions


def is_active_trainer(trainer, trainee):
    """
    Sprawdza, czy `trainer` ma aktywną relację TrainerTrainee z `trainee`.
    Jeśli ktoś "wysyła" trening/plan sam do siebie, traktujemy to jak zwykłe tworzenie.
    """
    from users.models import TrainerTrainee

    if trainer == trainee:
        return True
    return TrainerTrainee.objects.filter(
        trainer=trainer, trainee=trainee, status=TrainerTrainee.Status.ACTIVE
    ).exists()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Niestandardowe uprawnienie:
    - Zezwala na odczyt (GET, HEAD, OPTIONS) każdemu zalogowanemu użytkownikowi.
    - Zezwala na zapis (PUT, PATCH, DELETE) tylko właścicielowi obiektu.
    """
    
    def has_object_permission(self, request, view, obj):
        # Akcje bezpieczne (odczyt) są zawsze dozwolone
        if request.method in permissions.SAFE_METHODS:
            return True

        # Sprawdzamy, kto jest właścicielem. 
        # Różne modele mają różnie nazwane pole właściciela, więc sprawdzamy je po kolei:
        if hasattr(obj, 'creator'):
            return obj.creator == request.user
            
        if hasattr(obj, 'author'):
            return obj.author == request.user
            
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        if hasattr(obj, 'sender'):
            return obj.sender == request.user

        # Jeśli model nie ma żadnego z powyższych pól, domyślnie blokujemy edycję
        return False