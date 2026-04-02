from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from .models import Listing, ListingImage
from .serializers import ListingSerializer, ListingImageSerializer
from .permissions import IsOwnerOrReadOnly, IsAuthenticatedAndEmailVerified

class ListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing listings.
    
    list: Get all active listings (public)
    create: Create a new listing (authenticated users with verified email only)
    retrieve: Get a single listing (public)
    update: Update a listing (owner only)
    destroy: Delete a listing (owner only)
    
    Restrictions:
    - Must be logged in with Google email to create/edit/delete
    - Can only have one active listing at a time
    - Can only edit/delete your own listings
    """
    queryset = Listing.objects.filter(is_active=True)
    serializer_class = ListingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'listing_type', 'dorm_name']
    search_fields = ['title', 'description', 'location', 'dorm_name']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        """
        if self.action == 'list' or self.action == 'retrieve':
            # Anyone can view listings
            permission_classes = []
        elif self.action == 'create':
            # Must be authenticated with verified email to create
            permission_classes = [IsAuthenticatedAndEmailVerified]
        else:
            # Must be owner to update/delete
            permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to handle _limit parameter after ordering"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Apply limit AFTER ordering
        limit = request.query_params.get('_limit')
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except (ValueError, TypeError):
                pass
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        # Check if user already has an active listing
        existing_listing = Listing.objects.filter(
            user=self.request.user,
            is_active=True
        ).first()
        
        if existing_listing:
            raise ValidationError({
                'error': 'You already have an active listing. Please delete or deactivate your existing listing before creating a new one.',
                'existing_listing_id': existing_listing.id
            })
        
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        # Only allow owner to update
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to edit this listing.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow owner to delete
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to delete this listing.")
        instance.delete()
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
        """Get listings created by the current user"""
        listings = Listing.objects.filter(user=request.user)
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def can_create(self, request):
        """Check if user can create a new listing (doesn't have an active one)"""
        existing_listing = Listing.objects.filter(
            user=request.user,
            is_active=True
        ).first()
        
        if existing_listing:
            return Response({
                'can_create': False,
                'reason': 'You already have an active listing',
                'existing_listing': ListingSerializer(existing_listing).data
            })
        
        return Response({
            'can_create': True,
            'reason': None
        })
