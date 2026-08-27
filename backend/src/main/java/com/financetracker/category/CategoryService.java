package com.financetracker.category;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> findAll() {
        return categoryRepository.findAllByOrderByTypeAscNameAsc().stream()
                .map(CategoryDto::from)
                .toList();
    }

    @Transactional
    public CategoryDto create(CategoryRequest request) {
        categoryRepository.findByNameAndType(request.name(), request.type()).ifPresent(c -> {
            throw new IllegalArgumentException("A " + request.type() + " category named '" + request.name() + "' already exists");
        });

        Category category = new Category();
        applyRequest(category, request);
        return CategoryDto.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category " + id + " not found"));
        applyRequest(category, request);
        return CategoryDto.from(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Category " + id + " not found");
        }
        try {
            categoryRepository.deleteById(id);
            categoryRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException(
                    "Cannot delete this category while it still has transactions linked to it");
        }
    }

    private void applyRequest(Category category, CategoryRequest request) {
        category.setName(request.name());
        category.setType(request.type());
        category.setMonthlyBudget(request.type() == CategoryType.EXPENSE ? request.monthlyBudget() : null);
        category.setColor(request.color());
    }
}
