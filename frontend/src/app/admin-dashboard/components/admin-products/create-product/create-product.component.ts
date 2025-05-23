import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../../products/services/products.service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';

interface ImagePreview {
  file: File;
  preview: string;
}

@Component({
  selector: 'create-product',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProductComponent {
  private fb = inject(FormBuilder);
  private productService = inject(ProductsService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  imagePreviews: ImagePreview[] = [];
  selectedFiles: File[] = [];

  productForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    precio: ['', [Validators.required, Validators.min(0)]],
    disponible: [true, [Validators.required]],
    imagenes: [null, [Validators.required]]
  });

  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
      this.imagePreviews = [];
      
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push({
            file: file,
            preview: reader.result as string
          });
        };
        reader.readAsDataURL(file);
      });

      this.productForm.patchValue({
        imagenes: this.selectedFiles
      });
    }
  }

  removeImage(index: number) {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    
    if (this.selectedFiles.length === 0) {
      this.productForm.patchValue({
        imagenes: null
      });
    } else {
      this.productForm.patchValue({
        imagenes: this.selectedFiles
      });
    }
  }

  async onSubmit() {
    if (this.productForm.invalid || this.selectedFiles.length === 0) {
      this.toastService.showToast('Por favor, complete todos los campos requeridos', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.productForm.get('nombre')?.value);
    formData.append('descripcion', this.productForm.get('descripcion')?.value);
    formData.append('precio', this.productForm.get('precio')?.value);
    formData.append('disponible', this.productForm.get('disponible')?.value);
    
    // Append each image to formData
    this.selectedFiles.forEach((file, index) => {
      formData.append('imagen', file);
    });

    try {
      const result = await this.productService.createProduct(formData);
      if (result) {
        this.toastService.showToast('Producto creado correctamente', 'success');
        this.router.navigate(['/admin-dashboard/productos']);
      }
    } catch (error) {
      this.toastService.showToast('Error al crear el producto', 'error');
      console.error('Error creating product:', error);
    }
  }
} 