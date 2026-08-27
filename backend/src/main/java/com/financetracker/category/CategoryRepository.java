package com.financetracker.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOrderByTypeAscNameAsc();

    Optional<Category> findByNameAndType(String name, CategoryType type);
}
