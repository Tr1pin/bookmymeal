import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../../products/services/products.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { Product } from '../../../../products/interfaces/Product';
import { Observable, tap } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductCategoryService } from '../../../../products/services/product-category.service.js';
import { ProductCategory } from '../../../../products/interfaces/ProductCategory.js';
import { CommonModule } from '@angular/common';

const FALLBACK_IMAGE = '../../../assets/images/static/empty.jpg';

interface ImagePreview {
  file: File;
  preview: string;
  isNew?: boolean;
  filename?: string;
}

@Component({
  selector: 'update-product',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './update-product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateProductComponent {
  private fb = inject(FormBuilder);
  private productService = inject(ProductsService);
  private productCategoryService = inject(ProductCategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  productId = this.route.snapshot.params['id'];
  imagePreviews: ImagePreview[] = [];
  selectedFiles: File[] = [];
  currentImages: string[] = [];
  fallbackImage = FALLBACK_IMAGE;
  categories$: Observable<ProductCategory[]> = this.productCategoryService.getCategories();

  productForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    precio: ['', [Validators.required, Validators.min(0)]],
    disponible: [true, [Validators.required]],
    imagenes: [null],
    categoria_id: ['', [Validators.required]]
  });

  handleImageError(preview: ImagePreview) {
    preview.preview = this.fallbackImage;
  }

  productResource = rxResource<Product, { id: string }>({
    request: () => ({ id: this.productId }),
    loader: ({ request }) => {
      return this.productService.getProduct(request.id).pipe(
        tap((product) => {
          this.productForm.patchValue({
            nombre: product.nombre,
            descripcion: product.descripcion,
            precio: product.precio,
            disponible: product.disponible === 1,
            categoria_id: product.categoria_id
          });
          
          // Load existing images
          try {
            const imagesString = typeof product.imagens === 'string' ? product.imagens : JSON.stringify(product.imagens);
            const parsedImages = JSON.parse(imagesString);
            
            if (Array.isArray(parsedImages) && parsedImages.some((img: string | null) => img !== null)) {
              this.currentImages = parsedImages.filter((img: string | null) => img !== null) as string[];
              this.imagePreviews = this.currentImages.map(img => ({
                preview: `http://localhost:3001/images/products/${img}`,
                file: null as any,
                isNew: false,
                filename: img
              }));
            } else {
              this.currentImages = [];
              this.imagePreviews = [];
            }
          } catch (error) {
            console.error('Error parsing images:', error);
            this.currentImages = [];
            this.imagePreviews = [];
          }
        })
      );
    }
  });

  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
      
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push({
            file: file,
            preview: reader.result as string,
            isNew: true
          });
        };
        reader.readAsDataURL(file);
      });

      this.productForm.patchValue({
        imagenes: this.selectedFiles
      });
    }
  }

  async removeImage(index: number) {
    const removedImage = this.imagePreviews[index];
    
    try {
      // If it's an existing image (not a new upload), delete it from the server
      if (!removedImage.isNew && removedImage.filename) {
        await this.productService.deleteProductImage(this.productId, removedImage.filename);
      }

      // Remove from preview array
      this.imagePreviews.splice(index, 1);
      
      // Handle file arrays
      if (removedImage.isNew) {
        const fileIndex = this.selectedFiles.findIndex(f => f === removedImage.file);
        if (fileIndex > -1) {
          this.selectedFiles.splice(fileIndex, 1);
        }
      } else {
        const imgIndex = this.currentImages.findIndex(img => img === removedImage.filename);
        if (imgIndex > -1) {
          this.currentImages.splice(imgIndex, 1);
        }
      }

      if (this.selectedFiles.length === 0 && this.currentImages.length === 0) {
        this.productForm.patchValue({
          imagenes: null
        });
      }

      this.toastService.showToast('Imagen eliminada correctamente', 'success');
      
      // Reload the product data to ensure the UI is in sync with the server
      this.productResource.reload();
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      this.toastService.showToast('Error al eliminar la imagen', 'error');
    }
  }

  async onSubmit() {
    if (this.productForm.invalid) {
      this.toastService.showToast('Por favor, complete todos los campos requeridos', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('id', this.productId);
    formData.append('nombre', this.productForm.get('nombre')?.value);
    formData.append('descripcion', this.productForm.get('descripcion')?.value);
    formData.append('precio', this.productForm.get('precio')?.value);
    formData.append('disponible', this.productForm.get('disponible')?.value);
    formData.append('categoria_id', this.productForm.get('categoria_id')?.value);
    
    // Append each new image to formData
    const newImages = this.imagePreviews.filter(preview => preview.isNew);
    newImages.forEach(preview => {
      if (preview.file) {
        formData.append('imagen', preview.file);
      }
    });

    try {
      const result = await this.productService.updateProduct(formData);
      if (result) {
        this.toastService.showToast('Producto actualizado correctamente', 'success');
        this.router.navigate(['/admin-dashboard/productos']);
      }
    } catch (error) {
      this.toastService.showToast('Error al actualizar el producto', 'error');
      console.error('Error updating product:', error);
    }
  }
} 